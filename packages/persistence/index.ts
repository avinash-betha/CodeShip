import { type Project, clone } from "../document-model";
import { parseProject } from "../validation";
export interface ProjectRepository {
  list(): Promise<Project[]>;
  get(id: string): Promise<Project | undefined>;
  save(project: Project): Promise<void>;
  remove(id: string): Promise<void>;
}
export class IndexedDbRepository implements ProjectRepository {
  private db?: Promise<IDBDatabase>;
  constructor(private name = "codeship-studio") {}
  private open(): Promise<IDBDatabase> {
    return (this.db ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("projects", { keyPath: "id" });
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close();
          this.db = undefined;
        };
        resolve(request.result);
      };
      request.onerror = () => {
        this.db = undefined;
        reject(
          new Error(
            "Local storage is unavailable. Export your project JSON to keep a backup.",
          ),
        );
      };
      request.onblocked = () =>
        reject(new Error("Close older CodeShip tabs to update local storage."));
    }));
  }
  private async request<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("projects", mode),
        request = operation(tx.objectStore("projects"));
      let result: T;
      request.onsuccess = () => {
        result = request.result;
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () =>
        reject(
          new Error(tx.error?.message ?? "Project storage operation failed."),
        );
      tx.onabort = () =>
        reject(new Error("Project storage transaction was aborted."));
    });
  }
  async list(): Promise<Project[]> {
    const projects = await this.request("readonly", (s) => s.getAll());
    return (projects as Project[])
      .map((p) => parseProject(JSON.stringify(p)))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  async get(id: string): Promise<Project | undefined> {
    const p: unknown = await this.request("readonly", (s) => s.get(id));
    return p ? parseProject(JSON.stringify(p)) : undefined;
  }
  async save(project: Project): Promise<void> {
    const safe = parseProject(JSON.stringify(project));
    await this.request("readwrite", (s) => s.put(clone(safe)));
  }
  async remove(id: string): Promise<void> {
    await this.request("readwrite", (s) => s.delete(id));
  }
}
