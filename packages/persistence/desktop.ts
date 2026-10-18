import type { ProjectRepository } from "./index";
import type { Project } from "../document-model";
import { desktop } from "../desktop-bridge";
export class DesktopProjectRepository implements ProjectRepository {
  private get api() {
    const api = desktop();
    if (!api) throw new Error("Desktop bridge is unavailable.");
    return api;
  }
  list() {
    return this.api.listProjects();
  }
  get(id: string) {
    return this.api.getProject(id);
  }
  save(project: Project) {
    return this.api.saveProject(project);
  }
  async remove(id: string) {
    if (!(await this.api.deleteProject(id)))
      throw new Error("Project deletion cancelled.");
  }
}
