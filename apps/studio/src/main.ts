import { bootstrapApplication } from "@angular/platform-browser";
import { StudioComponent } from "./studio.component";
import { desktop } from "../../../packages/desktop-bridge";
async function boot() {
  const settings = await desktop()?.getSettings();
  if (settings) {
    localStorage.setItem("codeship-preferences", JSON.stringify(settings));
    if (settings.tutorial)
      localStorage.setItem("codeship-onboarding-v1", settings.tutorial);
  }
  await bootstrapApplication(StudioComponent);
}
void boot().catch(console.error);
