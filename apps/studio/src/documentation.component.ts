import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  effect,
  inject,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IconComponent } from "./ui/icon.component";
import { PreferencesService } from "./preferences.service";
import { copyText } from "../../../packages/desktop-bridge";
import {
  docArticles,
  docHeadings,
  findDocs,
  resolveDocSection,
} from "./docs-registry";
import { docsVersion } from "./docs-model";
import { DocsCodeComponent } from "./docs-code.component";
@Component({
  selector: "cs-documentation",
  imports: [FormsModule, IconComponent, DocsCodeComponent],
  templateUrl: "./documentation.component.html",
  styleUrl: "./documentation.component.css",
})
export class DocumentationComponent implements AfterViewInit, OnDestroy {
  readonly preferences = inject(PreferencesService);
  private host: ElementRef<HTMLElement> = inject(ElementRef);
  readonly action = output<string>();
  readonly exit = output<void>();
  readonly visit = output<string>();
  readonly expandChange = output<boolean>();
  readonly version = docsVersion;
  readonly articles = docArticles;
  readonly categories = [...new Set(docArticles.map((a) => a.category))];
  readonly search = signal("");
  readonly id = signal(this.initialArticle());
  readonly expanded = signal(false);
  readonly navOpen = signal(true);
  readonly tocOpen = signal(window.innerWidth > 1200);
  readonly folded = signal<string[]>(this.read("folded", []));
  readonly bookmarks = signal<string[]>(this.read("bookmarks", []));
  readonly savedOnly = signal(false);
  readonly activeSection = signal("introduction");
  readonly linkStatus = signal("");
  readonly current = computed(
    () => docArticles.find((a) => a.id === this.id()) ?? docArticles[0],
  );
  readonly index = computed(() => docArticles.indexOf(this.current()));
  readonly filtered = computed(() =>
    findDocs(this.search()).filter(
      (a) => !this.savedOnly() || this.bookmarks().includes(a.id),
    ),
  );
  readonly headings = computed(() => docHeadings(this.current()));
  readonly minutes = computed(() =>
    Math.max(
      1,
      Math.ceil(
        (this.current().intro + JSON.stringify(this.current().sections)).split(
          /\s+/,
        ).length / 200,
      ),
    ),
  );
  readonly related = computed(() =>
    [
      ...new Set([
        ...(this.current().related ?? []),
        ...docArticles
          .filter((a) => a.category === this.current().category)
          .map((a) => a.id),
      ]),
    ]
      .map((id) => docArticles.find((a) => a.id === id)!)
      .filter((a) => a && a.id !== this.id())
      .slice(0, 4),
  );
  private hashChanged = () => this.fromHash();
  private disposed = false;
  constructor() {
    effect(() => this.expandChange.emit(this.expanded()));
    effect(() => {
      this.write("folded", this.folded());
      this.write("bookmarks", this.bookmarks());
    });
    window.addEventListener("hashchange", this.hashChanged);
  }
  private read<T>(name: string, fallback: T): T {
    try {
      const v = JSON.parse(
        localStorage.getItem("codeship-docs-v1-" + name) ?? "null",
      );
      return Array.isArray(v) && v.every((x) => typeof x === "string")
        ? (v as T)
        : fallback;
    } catch {
      return fallback;
    }
  }
  private write(name: string, value: unknown) {
    try {
      localStorage.setItem("codeship-docs-v1-" + name, JSON.stringify(value));
    } catch {
      /* Optional preference. */
    }
  }
  private initialArticle() {
    const hash = location.hash.split("/")[1];
    let candidate = hash;
    try {
      candidate ||= localStorage.getItem("codeship-docs-last") ?? "";
    } catch {
      /* Optional preference. */
    }
    return docArticles.some((a) => a.id === candidate)
      ? candidate
      : "introduction";
  }
  ngAfterViewInit() {
    this.fromHash();
  }
  ngOnDestroy() {
    this.disposed = true;
    window.removeEventListener("hashchange", this.hashChanged);
    if (location.hash.startsWith("#docs/"))
      history.replaceState(null, "", location.pathname + location.search);
  }
  hasCategory(category: string) {
    return this.filtered().some((a) => a.category === category);
  }
  groupArticles(category: string) {
    return this.filtered().filter((a) => a.category === category);
  }
  toggleCategory(category: string) {
    this.folded.update((v) =>
      v.includes(category) ? v.filter((c) => c !== category) : [...v, category],
    );
  }
  isFolded(category: string) {
    return !this.search() && this.folded().includes(category);
  }
  highlight(text: string) {
    const terms = this.search().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [{ text, match: false }];
    const escaped = terms
      .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    return text
      .split(new RegExp("(" + escaped + ")", "gi"))
      .filter(Boolean)
      .map((text) => ({
        text,
        match: terms.some((t) => t.toLowerCase() === text.toLowerCase()),
      }));
  }
  open(id: string, section = "introduction") {
    if (!docArticles.some((a) => a.id === id)) return;
    this.id.set(id);
    this.visit.emit(id);
    this.activeSection.set(section);
    this.linkStatus.set("");
    try {
      localStorage.setItem("codeship-docs-last", id);
    } catch {
      /* Optional preference. */
    }
    history.replaceState(null, "", `#docs/${id}/${section}`);
    requestAnimationFrame(() => this.scroll(section, false));
  }
  move(delta: number) {
    const a = docArticles[this.index() + delta];
    if (a) this.open(a.id);
  }
  scroll(id: string, smooth = true) {
    if (this.disposed) return;
    const target = this.host.nativeElement.querySelector<HTMLElement>(
      `[data-section="${id.replace(/[^a-z0-9-]/g, "")}"]`,
    );
    const article =
      this.host.nativeElement.querySelector<HTMLElement>(".docs-article");
    if (target && article)
      article.scrollTo({
        top:
          id === "introduction"
            ? 0
            : target.getBoundingClientRect().top -
              article.getBoundingClientRect().top +
              article.scrollTop -
              28,
        behavior:
          smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "smooth"
            : "instant",
      });
    this.activeSection.set(id);
    history.replaceState(null, "", `#docs/${this.id()}/${id}`);
  }
  trackSection() {
    const article =
      this.host.nativeElement.querySelector<HTMLElement>(".docs-article");
    if (!article) return;
    const sections = [
      ...article.querySelectorAll<HTMLElement>("[data-section]"),
    ];
    const active = sections
      .filter(
        (s) =>
          s.getBoundingClientRect().top <=
          article.getBoundingClientRect().top + 100,
      )
      .at(-1);
    if (active) this.activeSection.set(active.dataset["section"]!);
  }
  private fromHash() {
    const [prefix, id, section] = location.hash.split("/");
    if (prefix === "#docs") {
      const article = docArticles.find((a) => a.id === id) ?? docArticles[0];
      this.id.set(article.id);
      requestAnimationFrame(() =>
        this.scroll(resolveDocSection(this.current(), section), false),
      );
    }
  }
  bookmark() {
    this.bookmarks.update((v) =>
      v.includes(this.id())
        ? v.filter((id) => id !== this.id())
        : [...v, this.id()],
    );
  }
  async copyLink(section: string) {
    try {
      await copyText(
        `${location.origin}${location.pathname}#docs/${this.id()}/${section}`,
      );
      this.linkStatus.set("Section link copied.");
    } catch {
      this.linkStatus.set(
        "Copy unavailable. The section is in the address fragment.",
      );
    }
  }
  @HostListener("window:keydown", ["$event"]) keys(event: KeyboardEvent) {
    if (
      event.key === "/" &&
      !(event.target as HTMLElement).matches("input,textarea,[contenteditable]")
    ) {
      event.preventDefault();
      this.host.nativeElement
        .querySelector<HTMLInputElement>(
          'input[aria-label="Search documentation"]',
        )
        ?.focus();
    }
  }
  print() {
    window.print();
  }
  theme() {
    this.preferences.theme(
      this.preferences.resolvedTheme() === "light" ? "dark" : "light",
    );
  }
}
