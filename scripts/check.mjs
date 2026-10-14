import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const required = [
  "src/content.js",
  "src/content.css",
  "manifests/chromium.json",
  "manifests/firefox.json",
  "_locales/en/messages.json",
  "_locales/cs/messages.json"
];

for (const file of required) {
  await access(resolve(root, file));
}

for (const file of [
  "manifests/chromium.json",
  "manifests/firefox.json",
  "_locales/en/messages.json",
  "_locales/cs/messages.json"
]) {
  JSON.parse(await readFile(resolve(root, file), "utf8"));
}

const source = await readFile(resolve(root, "src/content.js"), "utf8");
for (const needle of [
  'data-markdown-text-style="assistant-message"',
  "buildDocxBlob",
  "openPdfPrintView",
  "MutationObserver",
  "craft-export-actions"
]) {
  if (!source.includes(needle)) {
    throw new Error(`Missing required implementation marker: ${needle}`);
  }
}

console.log("Static checks passed.");
