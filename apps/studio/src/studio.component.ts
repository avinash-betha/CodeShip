import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  signal,
  computed,
  AfterViewInit,
  effect,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { DomSanitizer } from "@angular/platform-browser";
import { EditorStore } from "../../../packages/editor-core/store";
import { type Project } from "../../../packages/document-model";
import {
  type ExportFiles,
  type ExportTarget,
  canvasDocument,
} from "../../../packages/codegen-core";
import {
  download,
  generateExport,
  zipExport,
} from "../../../packages/codegen-core/export";
import { parseProject } from "../../../packages/validation";
import { importHtml } from "../../../packages/editor-core/import";
import { LibraryComponent } from "./library.component";
import { CanvasComponent } from "./canvas.component";
import { InspectorComponent } from "./inspector.component";
import { CodeWorkspaceComponent } from "./code-workspace.component";
import { IconComponent } from "./ui/icon.component";
import { IconFactoryComponent } from "./icon-factory.component";
import { TutorialService, lessons } from "./tutorial.service";
import { TutorialComponent } from "./tutorial.component";
import { desktop, copyText } from "../../../packages/desktop-bridge";
import { PreferencesService } from "./preferences.service";
import { DocumentationComponent } from "./documentation.component";
import {
  WorkspaceViewService,
  type WorkspaceView,
} from "./workspace-view.service";
import { PreviewStudioComponent } from "./preview-studio.component";
import { SourcePreviewComponent } from "./source-preview.component";
import {
  defaultExportOptions,
  extractDesign,
  type ExportOptions,
  type ExportScope,
  type OutputMode,
} from "../../../packages/codegen-core/selection";
@Component({
  selector: "cs-studio",
  imports: [
    FormsModule,
    DatePipe,
    LibraryComponent,
    CanvasComponent,
    InspectorComponent,
    CodeWorkspaceComponent,
    IconComponent,
    IconFactoryComponent,
    TutorialComponent,
    DocumentationComponent,
    PreviewStudioComponent,
    SourcePreviewComponent,
  ],
  templateUrl: "./studio.component.html",
})
export class StudioComponent implements AfterViewInit {
  readonly store = inject(EditorStore);
  readonly preferences = inject(PreferencesService);
  readonly view = inject(WorkspaceViewService);
  readonly docsExpanded = signal(false);
  readonly native = desktop();
  readonly projectSearch = signal("");
  readonly projectSort = signal("updated");
  readonly filteredProjects = computed(() =>
    this.projects()
      .filter((p) =>
        p.name.toLowerCase().includes(this.projectSearch().toLowerCase()),
      )
      .sort((a, b) =>
        this.projectSort() === "name"
          ? a.name.localeCompare(b.name)
          : b.updatedAt.localeCompare(a.updatedAt),
      ),
  );
  readonly tutorial = inject(TutorialService);
  readonly learningSearch = signal("");
  readonly lessons = computed(() =>
    lessons.filter((l) =>
      `${l.title} ${l.text}`
        .toLowerCase()
        .includes(this.learningSearch().toLowerCase()),
    ),
  );
  private readonly sanitizer = inject(DomSanitizer);
  readonly compareDocument = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      canvasDocument(this.store.project(), {
        interactive: true,
        nonce: desktop()?.previewNonce,
      }),
    ),
  );
  readonly devices = [
    { name: "Desktop", width: 1200, scale: 0.25 },
    { name: "Tablet", width: 768, scale: 0.39 },
    { name: "Mobile", width: 375, scale: 0.8 },
  ];
  readonly Math = Math;
  readonly codeOpen = signal(false);
  readonly leftOpen = signal(window.innerWidth >= 700);
  readonly rightOpen = signal(window.innerWidth >= 1000);
  readonly rightMode = signal<"properties" | "responsive">("properties");
  readonly modal = signal<
    | "projects"
    | "import"
    | "export"
    | "help"
    | "devices"
    | "icons"
    | "welcome"
    | "learn"
    | "settings"
    | "docs"
    | null
  >(null);
  readonly projects = signal<Project[]>([]);
  readonly target = signal<ExportTarget>("html");
  readonly exportFiles = signal<ExportFiles>({});
  readonly exporting = signal(false);
  readonly exportOptions = signal<ExportOptions>({ ...defaultExportOptions });
  readonly exportReport = signal<ReturnType<typeof extractDesign> | null>(null);
  readonly exportExpanded = signal(false);
  readonly exportLabel = computed(() => {
    const framework =
      this.target() === "nextjs"
        ? "Next.js"
        : this.target() === "angular"
          ? "Angular"
          : "HTML";
    const mode = this.exportOptions().mode;
    return mode === "project"
      ? "Download Project ZIP"
      : `Export ${framework} ${mode === "component" ? "Component" : mode === "snippet" ? "Snippet" : "Screen"}`;
  });
  private exportRevision = 0;
  async exportOption(key: "scope" | "mode" | "name", value: string) {
    this.exportOptions.update((o) => ({
      ...o,
      [key]: value,
      selectedIds: this.store.selected(),
      pageIds: o.pageIds.length ? o.pageIds : [this.store.page().id],
    }));
    if (key === "scope")
      this.exportOptions.update((o) => ({
        ...o,
        mode:
          value === "selection"
            ? "component"
            : value === "screen"
              ? "screen"
              : "project",
      }));
    await this.prepareExport();
  }
  async exportPage(id: string, checked: boolean) {
    this.exportOptions.update((o) => ({
      ...o,
      pageIds: checked ? [...o.pageIds, id] : o.pageIds.filter((p) => p !== id),
    }));
    await this.prepareExport();
  }
  readonly exportScopes: { value: ExportScope; label: string }[] = [
    { value: "selection", label: "Selected elements" },
    { value: "screen", label: "Current screen" },
    { value: "screens", label: "Choose screens" },
    { value: "project", label: "Entire project" },
  ];
  readonly exportModes: { value: OutputMode; label: string }[] = [
    { value: "snippet", label: "Snippet" },
    { value: "component", label: "Reusable component" },
    { value: "screen", label: "Standalone screen" },
    { value: "project", label: "Complete project" },
  ];
  async copyExport() {
    try {
      await copyText(this.fileText());
      this.store.notify("Copied " + this.currentFile());
    } catch (error) {
      this.store.fail(error);
    }
  }
  async copyExportSelection() {
    const selection = window.getSelection();
    if (
      !selection?.toString() ||
      !document.querySelector(".export-browser")?.contains(selection.anchorNode)
    ) {
      this.store.notify("Select text in the generated source first.");
      return;
    }
    try {
      await copyText(selection.toString());
      this.store.notify("Selected source copied.");
    } catch (error) {
      this.store.fail(error);
    }
  }
  readonly modalError = signal("");
  readonly currentFile = signal("");
  readonly leftWidth = signal(248);
  readonly rightWidth = signal(286);
  readonly codeHeight = signal(260);
  @ViewChild(CanvasComponent) canvas?: CanvasComponent;
  @ViewChild(LibraryComponent) library?: LibraryComponent;
  @ViewChild(InspectorComponent) inspector?: InspectorComponent;
  @ViewChild(DocumentationComponent) documentation?: DocumentationComponent;
  @ViewChild("dialog") dialog?: ElementRef<HTMLDialogElement>;
  projectName = "";
  importHtmlText = "";
  importCssText = "";
  importName = "Imported project";
  readonly Object = Object;
  constructor() {
    effect(() => {
      const step = this.tutorial.step()?.id;
      if (
        this.tutorial.active() &&
        ["resize", "layout", "preset"].includes(step ?? "")
      ) {
        this.rightOpen.set(true);
        this.rightMode.set("properties");
      }
    });
    const layout = this.preferences.settings().workspace;
    if (typeof layout["leftWidth"] === "number")
      this.leftWidth.set(layout["leftWidth"]);
    if (typeof layout["rightWidth"] === "number")
      this.rightWidth.set(layout["rightWidth"]);
    if (typeof layout["codeHeight"] === "number")
      this.codeHeight.set(layout["codeHeight"]);
    if (typeof layout["leftOpen"] === "boolean")
      this.leftOpen.set(layout["leftOpen"]);
    if (typeof layout["rightOpen"] === "boolean")
      this.rightOpen.set(layout["rightOpen"]);
    effect(() =>
      this.preferences.layout({
        leftWidth: this.leftWidth(),
        rightWidth: this.rightWidth(),
        codeHeight: this.codeHeight(),
        leftOpen: this.leftOpen(),
        rightOpen: this.rightOpen(),
      }),
    );
    this.native?.onCommand((command) => {
      if (command === "save") void this.store.persist();
      else if (command === "open") void this.openNative();
      else if (command === "save-as") void this.saveAsNative();
      else if (command === "undo") this.store.undo();
      else if (command === "redo") this.store.redo();
      else if (command === "docs") void this.show("docs");
      else if (command === "focus-canvas")
        this.setView(this.view.mode() === "canvas" ? "editor" : "canvas");
      else if (command === "full-preview") this.setView("preview");
      else if (command === "focus-code") this.setView("code");
      else if (["projects", "export"].includes(command))
        void this.show(command as "projects" | "export");
    });
  }
  async openNative() {
    try {
      const project = await this.native?.openProject();
      if (project) {
        await this.store.open(project);
        this.close();
      }
    } catch (error) {
      this.store.fail(error);
    }
  }
  async saveAsNative() {
    try {
      const project = await this.native?.saveProjectAs(this.store.project());
      if (project) {
        await this.store.open(project, false);
        await this.refreshProjects();
      }
    } catch (error) {
      this.store.fail(error);
    }
  }
  async nativeBackup() {
    try {
      await this.store.persist();
      const path = await this.native?.backupProject(this.store.project().id);
      if (path) this.store.notify("Backup saved: " + path);
    } catch (error) {
      this.store.fail(error);
    }
  }
  async nativeRecover() {
    try {
      const project = await this.native?.recoverProject(
        this.store.project().id,
      );
      if (project) await this.store.open(project);
    } catch (error) {
      this.store.fail(error);
    }
  }
  async nativeExport() {
    try {
      const folder = await this.native?.exportFolder(
        this.exportFiles(),
        this.slug(),
      );
      if (folder) this.store.notify("Exported to " + folder);
    } catch (error) {
      this.store.fail(error);
    }
  }
  docAction(action: string) {
    this.close();
    this.view.restore();
    this.store.mode.set("edit");
    if (action === "focus-canvas") this.setView("canvas");
    else if (action === "full-preview") this.setView("preview");
    else if (
      ["projects", "icons", "export", "import", "settings"].includes(action)
    )
      void this.show(
        action as "projects" | "icons" | "export" | "import" | "settings",
      );
    else if (action === "tutorial") this.startTutorial();
    else if (action === "code") {
      this.codeOpen.set(true);
    } else if (action === "responsive") this.analyze();
    else if (["templates", "components", "layers"].includes(action)) {
      this.leftOpen.set(true);
      this.library?.tab.set(action === "layers" ? "layers" : "insert");
      this.library?.search.set("");
      this.library?.category.set("All");
      this.library?.componentCategory.set("All");
      this.library?.screenCategory.set("All");
    } else if (["motion", "design", "html-inspector"].includes(action)) {
      this.rightOpen.set(true);
      this.rightMode.set("properties");
      this.inspector?.tab.set(
        action === "html-inspector"
          ? "html"
          : action === "motion"
            ? "motion"
            : "design",
      );
    }
  }
  setView(mode: WorkspaceView) {
    this.view.enter(mode);
    if (mode === "canvas") this.tutorial.record("focus-canvas");
    if (mode === "preview") this.tutorial.record("full-preview");
  }
  docVisit(id: string) {
    if (["angular", "nextjs", "html"].includes(id))
      this.tutorial.record("integration-guide");
  }
  ngAfterViewInit(): void {
    queueMicrotask(() => {
      if (location.hash.startsWith("#docs/")) void this.show("docs");
      else if (!this.tutorial.state().welcomed) void this.show("welcome");
    });
  }
  startTutorial(restart = false): void {
    this.close();
    this.leftOpen.set(true);
    this.rightOpen.set(true);
    this.library?.tab.set("insert");
    this.library?.search.set("");
    this.library?.category.set("All");
    this.tutorial.start(restart);
  }
  async welcomeAction(action: string): Promise<void> {
    this.tutorial.welcomeDone();
    this.close();
    if (action === "tutorial") {
      this.startTutorial();
      return;
    }
    if (action === "blank") {
      await this.store.newProject("My first project");
      return;
    }
    if (action === "templates" || action === "components") {
      this.leftOpen.set(true);
      this.library?.tab.set("insert");
      this.library?.search.set("");
      setTimeout(() => {
        const sections =
          document.querySelectorAll<HTMLElement>(".library-section");
        sections[action === "templates" ? 1 : 0]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 30);
      return;
    }
    if (action === "icons") await this.show("icons");
    if (action === "import") await this.show("import");
    if (action === "docs" || action === "walkthrough") {
      await this.show("docs");
      queueMicrotask(() =>
        this.documentation?.open(
          action === "walkthrough" ? "visual-walkthrough" : "getting-started",
        ),
      );
    }
  }
  lessonAction(action: string): void {
    if (action === "tutorial") {
      this.startTutorial();
      return;
    }
    this.close();
    this.leftOpen.set(true);
    this.rightOpen.set(true);
    if (action === "icons" || action === "export" || action === "help") {
      void this.show(action);
      return;
    }
    if (action === "code") {
      this.codeOpen.set(true);
      return;
    }
    if (action === "responsive") {
      this.canvas?.setViewport(375);
      return;
    }
    if (action === "forms") {
      this.library?.search.set("Contact form");
      return;
    }
    if (action === "templates") {
      void this.welcomeAction("templates");
      return;
    }
    if (action === "motion")
      this.store.notify(
        "Select an element, then open Motion in the properties panel.",
      );
  }
  @HostListener("window:keydown", ["$event"]) keydown(
    event: KeyboardEvent,
  ): void {
    if (event.key === "F11" && !this.native) {
      event.preventDefault();
      void this.view.toggleFullScreen();
      return;
    }
    if (event.key === "Escape" && !this.dialog?.nativeElement.open) {
      if (this.view.mode() !== "editor") {
        event.preventDefault();
        this.view.restore();
        return;
      }
      if (this.view.fullScreen()) {
        event.preventDefault();
        void this.view.exitFullScreen();
        return;
      }
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === "f" &&
      !this.native &&
      !this.dialog?.nativeElement.open
    ) {
      event.preventDefault();
      this.setView(this.view.mode() === "canvas" ? "editor" : "canvas");
      return;
    }
    if (this.dialog?.nativeElement.open) return;
    if (["preview", "code"].includes(this.view.mode())) return;
    this.canvas?.shortcut(event);
    if (
      event.key === "/" &&
      !(event.target as HTMLElement).matches(
        "input,textarea,select,[contenteditable]",
      )
    ) {
      event.preventDefault();
      document
        .querySelector<HTMLInputElement>('input[aria-label="Search library"]')
        ?.focus();
    }
  }
  @HostListener("window:beforeunload", ["$event"]) beforeUnload(
    event: BeforeUnloadEvent,
  ): void {
    if (["unsaved", "saving", "error"].includes(this.store.saved())) {
      event.preventDefault();
    }
  }
  @HostListener("window:hashchange") openDocLink() {
    if (location.hash.startsWith("#docs/") && this.modal() !== "docs")
      void this.show("docs");
  }
  async show(
    type:
      | "projects"
      | "import"
      | "export"
      | "help"
      | "devices"
      | "icons"
      | "welcome"
      | "learn"
      | "settings"
      | "docs",
  ): Promise<void> {
    this.modalError.set("");
    this.modal.set(type);
    this.dialog?.nativeElement.showModal();
    if (type === "projects") {
      this.projectName = "";
      await this.refreshProjects();
    }
    if (type === "export") await this.prepareExport();
  }
  close(): void {
    if (this.modal() === "docs" && location.hash.startsWith("#docs/"))
      history.replaceState(null, "", location.pathname + location.search);
    if (this.modal() === "welcome") this.tutorial.welcomeDone();
    this.dialog?.nativeElement.close();
    this.modal.set(null);
    this.docsExpanded.set(false);
    this.exportExpanded.set(false);
  }
  dialogCancel(event: Event) {
    if (this.modal() === "export" && this.exportExpanded()) {
      event.preventDefault();
      this.exportExpanded.set(false);
      return;
    }
    if (this.modal() === "docs" && this.docsExpanded()) {
      event.preventDefault();
      this.documentation?.expanded.set(false);
      this.docsExpanded.set(false);
    }
  }
  dialogClosed(): void {
    if (this.dialog?.nativeElement.open) return;
    if (this.modal() === "docs" && location.hash.startsWith("#docs/"))
      history.replaceState(null, "", location.pathname + location.search);
    if (this.modal() === "welcome") this.tutorial.welcomeDone();
    this.modal.set(null);
  }
  dialogClick(event: MouseEvent): void {
    if (event.target === this.dialog?.nativeElement) this.close();
  }
  async refreshProjects(): Promise<void> {
    try {
      this.projects.set(await this.store.repository.list());
    } catch (error) {
      this.modalError.set(String(error));
    }
  }
  async create(): Promise<void> {
    await this.store.newProject(this.projectName.trim() || "Untitled project");
    this.close();
  }
  async open(p: Project): Promise<void> {
    await this.store.open(p);
    this.close();
  }
  async duplicate(p: Project): Promise<void> {
    await this.store.duplicateProject(p);
    await this.refreshProjects();
  }
  async remove(p: Project): Promise<void> {
    try {
      await this.store.deleteProject(p.id);
      await this.refreshProjects();
    } catch (error) {
      this.modalError.set(String(error));
    }
  }
  exportJson(): void {
    download(
      JSON.stringify(this.store.project(), null, 2),
      this.slug() + ".codeship.json",
      "application/json",
    );
  }
  async importFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (file.name.endsWith(".json")) {
        await this.store.open(parseProject(text));
        this.close();
      } else if (file.name.endsWith(".css")) {
        this.importCssText = text;
        this.store.notify(
          "CSS imported. Provide HTML to measure the original layout accurately.",
        );
      } else this.importHtmlText = text;
    } catch (error) {
      this.modalError.set(
        error instanceof Error ? error.message : String(error),
      );
    }
    (event.target as HTMLInputElement).value = "";
  }
  importSource(): void {
    try {
      if (!this.importHtmlText.trim()) {
        if (!this.store.setCss(this.importCssText))
          throw new Error(
            "CSS could not be imported. Correct the reported validation error.",
          );
        this.store.notify(
          "CSS applied to the current page. Original DOM is needed to analyze an external design accurately.",
        );
        this.close();
        return;
      }
      const imported = importHtml(this.importHtmlText, this.importCssText);
      const importedSuccessfully = this.store.transact("Import source", (p) => {
        const page = p.pages.find((pg) => pg.id === p.activePageId)!;
        page.root = imported.root;
        page.css = imported.css;
      });
      if (!importedSuccessfully)
        throw new Error(
          "HTML could not be imported. Correct the reported document validation error.",
        );
      this.store.selected.set([]);
      if (imported.warnings.length)
        this.store.notify(imported.warnings.join(" "));
      else this.store.notify("HTML and CSS imported as editable elements.");
      this.close();
    } catch (error) {
      this.modalError.set(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  async prepareExport(): Promise<void> {
    const revision = ++this.exportRevision;
    this.exporting.set(true);
    this.exportReport.set(null);
    this.modalError.set("");
    this.exportFiles.set({});
    try {
      const options = {
        ...this.exportOptions(),
        selectedIds: this.store.selected(),
      };
      const report = extractDesign(this.store.project(), options);
      const files = await generateExport(
        this.store.project(),
        this.target(),
        options,
      );
      if (revision !== this.exportRevision) return;
      this.exportReport.set(report);
      if (options.scope === "selection")
        this.tutorial.record("selective-export");
      this.exportFiles.set(files);
      this.currentFile.set(Object.keys(files)[0] ?? "");
    } catch (error) {
      if (revision !== this.exportRevision) return;
      this.modalError.set(
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      if (revision === this.exportRevision) this.exporting.set(false);
    }
  }
  async changeTarget(target: ExportTarget): Promise<void> {
    this.target.set(target);
    await this.prepareExport();
  }
  downloadExport(): void {
    this.tutorial.record("export");
    const zip = zipExport(this.exportFiles());
    download(
      zip.slice().buffer as ArrayBuffer,
      `${this.slug()}-${this.target()}.zip`,
      "application/zip",
    );
    this.store.notify(`${this.target().toUpperCase()} project downloaded.`);
  }
  fileText(): string {
    const content = this.exportFiles()[this.currentFile()];
    return typeof content === "string"
      ? content
      : `Binary asset · ${content?.length ?? 0} bytes`;
  }
  private slug(): string {
    return (
      this.store
        .project()
        .name.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "codeship-project"
    );
  }
  analyze(): void {
    this.rightOpen.set(true);
    this.rightMode.set("responsive");
    void this.canvas?.analyze().then(() => this.tutorial.record("analyze"));
  }
  addPage(): void {
    this.store.addPage(`Page ${this.store.project().pages.length + 1}`);
  }
  resize(event: PointerEvent, panel: "left" | "right" | "code"): void {
    event.preventDefault();
    const el = event.target as HTMLElement;
    el.setPointerCapture(event.pointerId);
    const x = event.clientX,
      y = event.clientY,
      left = this.leftWidth(),
      right = this.rightWidth(),
      height = this.codeHeight();
    const move = (e: PointerEvent) => {
      if (panel === "left")
        this.leftWidth.set(Math.max(205, Math.min(380, left + e.clientX - x)));
      else if (panel === "right")
        this.rightWidth.set(
          Math.max(250, Math.min(430, right + x - e.clientX)),
        );
      else
        this.codeHeight.set(
          Math.max(
            150,
            Math.min(window.innerHeight * 0.65, height + y - e.clientY),
          ),
        );
    };
    el.addEventListener("pointermove", move);
    el.addEventListener(
      "pointerup",
      () => el.removeEventListener("pointermove", move),
      { once: true },
    );
  }
}
