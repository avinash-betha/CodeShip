import { Component, computed, input, signal } from "@angular/core";
import { IconComponent } from "./ui/icon.component";
import { codeTokens } from "./documentation";
import { copyText } from "../../../packages/desktop-bridge";
import { DocCode } from "./docs-model";
@Component({
  selector: "cs-doc-code",
  imports: [IconComponent],
  template: `<div class="docs-code">
      <div>
        <span>{{ block().language }}</span
        ><button
          class="quiet-button"
          [attr.aria-label]="
            (copied() ? 'Copied' : 'Copy code') +
            ' · ' +
            block().language +
            ' example'
          "
          (click)="copy()"
        >
          <cs-icon name="copy" />{{ copied() ? "Copied" : "Copy code" }}
        </button>
      </div>
      <pre
        tabindex="0"
      ><code>@for (token of tokens();track $index) {<span [class]="'syntax-'+token.kind">{{token.text}}</span>}</code></pre>
    </div>
    <p class="docs-code-caption">{{ block().caption }}</p>
    <span class="sr-only" role="status">{{ status() }}</span>`,
})
export class DocsCodeComponent {
  readonly block = input.required<DocCode>();
  readonly tokens = computed(() => codeTokens(this.block().text));
  readonly copied = signal(false);
  readonly status = signal("");
  async copy() {
    try {
      await copyText(this.block().text);
      this.copied.set(true);
      this.status.set("Code copied.");
    } catch {
      this.status.set(
        "Copy unavailable. Select the example and copy it with your keyboard.",
      );
    }
  }
}
