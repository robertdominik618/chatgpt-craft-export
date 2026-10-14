import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const browser of ["chromium", "firefox"]) {
  const out = resolve(dist, browser);
  await mkdir(out, { recursive: true });
  await cp(resolve(root, "src/content.js"), resolve(out, "content.js"));
  await cp(resolve(root, "src/content.css"), resolve(out, "content.css"));
  await cp(resolve(root, "src/background.js"), resolve(out, "background.js"));
  await cp(resolve(root, "_locales"), resolve(out, "_locales"), { recursive: true });
  await cp(resolve(root, "assets"), resolve(out, "assets"), { recursive: true });
  const manifest = await readFile(resolve(root, `manifests/${browser}.json`), "utf8");
  await writeFile(resolve(out, "manifest.json"), manifest);
}

console.log("Built dist/chromium and dist/firefox");
