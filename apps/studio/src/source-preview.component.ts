import { Component, computed, input } from "@angular/core";
import { codeTokens } from "./documentation";
@Component({
  selector: "cs-source-preview",
  template: `<div
    class="source-lines"
    tabindex="0"
    role="region"
    aria-label="Generated file source"
  >
    <ol>
      @for (line of lines(); track $index) {
        <li>
          <code>
            @for (token of line; track $index) {
              <span [class]="'syntax-' + token.kind">{{ token.text }}</span>
            }
          </code>
        </li>
      }
    </ol>
  </div>`,
  styles: `
    :host {
      display: block;
      min-height: 0;
      min-width: 0;
      height: 100%;
    }
    .source-lines {
      height: 100%;
      overflow: auto;
      padding: 18px 0;
      background: var(--bg);
      font:
        12px/1.8 Consolas,
        monospace;
      color: var(--text);
    }
    .source-lines ol {
      margin: 0;
      padding: 0 24px 0 62px;
      min-width: max-content;
      counter-reset: line;
      list-style: none;
    }
    .source-lines li {
      position: relative;
      white-space: pre;
      min-height: 1.8em;
    }
    .source-lines li:before {
      counter-increment: line;
      content: counter(line);
      position: absolute;
      right: calc(100% + 18px);
      color: var(--muted);
      font-size: 10px;
      user-select: none;
    }
    .source-lines code {
      font: inherit;
    }
  `,
})
export class SourcePreviewComponent {
  readonly text = input("");
  readonly lines = computed(() =>
    this.text()
      .split("\n")
      .map((line) => codeTokens(line || " ")),
  );
}
