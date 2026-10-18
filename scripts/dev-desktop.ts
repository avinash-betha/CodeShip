import { spawn, type ChildProcess } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
let child: ChildProcess | undefined;
let stopping = false;
function stop() {
  stopping = true;
  if (child?.pid && child.exitCode === null) {
    if (process.platform === "win32")
      spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      }).unref();
    else child.kill("SIGTERM");
  }
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
async function run(executable: string, args: string[], env = process.env) {
  if (stopping) throw new Error("Desktop development stopped.");
  await new Promise<void>((resolve, reject) => {
    child = spawn(executable, args, {
      stdio: "inherit",
      windowsHide: true,
      env,
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 || stopping
        ? resolve()
        : reject(
            new Error(
              `${executable} exited with ${code}. See the errors above.`,
            ),
          ),
    );
  });
}
try {
  await run(process.execPath, [
    "node_modules/@angular/cli/bin/ng.js",
    "build",
    "--configuration",
    "development",
  ]);
  await run(process.execPath, [
    require.resolve("tsx/cli"),
    "scripts/build-desktop.ts",
  ]);
  await run(require("electron") as string, [resolve("dist/desktop/main.cjs")], {
    ...process.env,
    CODESHIP_DEVTOOLS: process.env["CODESHIP_DEVTOOLS"] ?? "1",
  });
} catch (error) {
  if (!stopping) {
    console.error(error);
    process.exitCode = 1;
  }
}
