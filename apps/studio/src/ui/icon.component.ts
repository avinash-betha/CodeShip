import { Component, input } from "@angular/core";
import { iconPaths } from "../../../../packages/icon-factory";
@Component({
  selector: "cs-icon",
  standalone: true,
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path()" /></svg>',
  styles:
    ":host{display:inline-flex;width:16px;height:16px;flex-shrink:0;align-items:center;justify-content:center}svg{width:100%;height:100%}",
})
export class IconComponent {
  name = input("box");
  path = () => iconPaths[this.name()] ?? iconPaths["box"];
}
