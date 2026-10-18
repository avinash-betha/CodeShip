import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnDestroy,
  signal,
} from "@angular/core";
import { TutorialService, tutorialSteps } from "./tutorial.service";
import { IconComponent } from "./ui/icon.component";
@Component({
  selector: "cs-tutorial",
  imports: [IconComponent],
  template: `
    @if (tutorial.active()) {
      @if (highlight(); as r) {
        <div
          class="tutorial-highlight"
          [style.left.px]="r.x"
          [style.top.px]="r.y"
          [style.width.px]="r.width"
          [style.height.px]="r.height"
        ></div>
      }
      <section
        class="tutorial-card"
        role="region"
        aria-label="Guided tutorial"
        aria-live="polite"
      >
        <div class="tutorial-card-top">
          <span class="eyebrow"
            >YOUR FIRST BUILD · {{ tutorial.state().index + 1 }} /
            {{ total }}</span
          ><button
            class="icon-button small"
            aria-label="Pause tutorial"
            (click)="tutorial.pause()"
          >
            <cs-icon name="close" />
          </button>
        </div>
        <div class="tutorial-progress">
          <span [style.width.%]="tutorial.percent()"></span>
        </div>
        <h2>{{ tutorial.step()?.title }}</h2>
        <p>{{ tutorial.step()?.body }}</p>
        <div class="tutorial-action-hint">
          <cs-icon name="pointer" />{{ tutorial.step()?.hint }}
        </div>
        <div class="tutorial-navigation">
          <button
            [disabled]="tutorial.state().index === 0"
            (click)="tutorial.back()"
          >
            Back</button
          ><button (click)="tutorial.pause()">Continue later</button
          ><button
            (click)="tutorial.skip()"
            title="Continue without recording this action as completed"
          >
            Next</button
          ><button (click)="tutorial.skip()">
            Skip step <cs-icon name="arrow" />
          </button>
        </div>
      </section>
    }
  `,
})
export class TutorialComponent implements AfterViewInit, OnDestroy {
  readonly tutorial = inject(TutorialService);
  readonly total = tutorialSteps.length;
  readonly highlight = signal<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  private timer?: ReturnType<typeof setInterval>;
  ngAfterViewInit() {
    this.timer = setInterval(() => this.position(), 250);
  }
  @HostListener("window:resize") position() {
    const element = this.tutorial.active()
      ? document.querySelector<HTMLElement>(this.tutorial.step()?.target ?? "")
      : null;
    const rect = element?.getBoundingClientRect();
    this.highlight.set(
      rect &&
        rect.width &&
        rect.height &&
        rect.top < innerHeight &&
        rect.bottom > 0
        ? {
            x: Math.max(3, rect.x - 4),
            y: Math.max(3, rect.y - 4),
            width: Math.min(rect.width + 8, innerWidth - 6),
            height: Math.min(rect.height + 8, innerHeight - 6),
          }
        : null,
    );
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
