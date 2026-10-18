import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
const root = await mkdtemp(join(tmpdir(), "codeship-portable-verify-")),
  projects = join(root, "projects");
await mkdir(projects);
const child = spawn(resolve("release/CodeShip-0.2.0-x64-portable.exe"), [], {
  windowsHide: true,
  stdio: "ignore",
  env: {
    ...process.env,
    CODESHIP_DESKTOP_SMOKE: "1",
    CODESHIP_TEST_USER_DATA: join(root, "user-data"),
    CODESHIP_TEST_PROJECTS: projects,
  },
});
let launchError: Error | undefined;
child.once("error", (error) => (launchError = error));
try {
  const deadline = Date.now() + 90000;
  let saved = "";
  while (Date.now() < deadline && !saved) {
    if (launchError) throw launchError;
    for (const directory of await readdir(projects)) {
      try {
        const path = join(projects, directory, "project.codeship.json"),
          project = JSON.parse(await readFile(path, "utf8"));
        if (project.schemaVersion === 1 && project.pages?.length) saved = path;
      } catch {
        /* Atomic creation can still be in progress. */
      }
    }
    if (!saved) await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (!saved)
    throw new Error(
      "Portable application did not complete its first native save.",
    );
  console.log(
    "Portable EXE extracted, launched its local renderer and saved a valid project through native IPC: " +
      saved,
  );
} finally {
  // Only this test's process tree is stopped; all files belong to its temporary profile.
  if (child.pid)
    await new Promise<void>((resolve) =>
      spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      }).once("exit", () => resolve()),
    );
}
