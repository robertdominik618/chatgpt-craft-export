# Installation Guide — Craft Export for ChatGPT

This guide explains how to install **Craft Export for ChatGPT** on Chrome/Chromium, Firefox, and Safari.

Always use the latest release:

https://github.com/robertdominik618/chatgpt-craft-export/releases/latest

> Note: Chrome and Firefox can currently be loaded as development extensions. Safari uses a Safari Web Extension Xcode project and requires Apple signing for normal distribution.

---

## 1. Chrome / Chromium / Edge

### Download

1. Open the Releases page:
   https://github.com/robertdominik618/chatgpt-craft-export/releases/latest
2. Download the Chromium package, for example:
   `craft-export-chromium-vX.Y.Z.zip`
3. Extract the ZIP into its own folder.

The extracted folder must directly contain:

`manifest.json`

### Install

1. Open:
   `chrome://extensions`
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the extracted folder that contains `manifest.json`.
5. Confirm that **Craft Export for ChatGPT** appears in the extension list.
6. Open or reload:
   https://chatgpt.com
7. Perform a hard refresh:
   - macOS: `⌘ + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

### Update

If you replaced the extension files with a newer version:

1. open `chrome://extensions`,
2. click **Reload** on **Craft Export for ChatGPT**,
3. hard-refresh ChatGPT.

### Verify

Export actions for WordCraft and PdfCraft should appear below ChatGPT responses, near the normal response controls and Adobe PDF action when present.

---

## 2. Firefox

### Download

1. Open:
   https://github.com/robertdominik618/chatgpt-craft-export/releases/latest
2. Download:
   `craft-export-firefox-vX.Y.Z.zip`
3. Extract the ZIP.

### Temporary development installation

1. Open:
   `about:debugging#/runtime/this-firefox`
2. Click:
   **Load Temporary Add-on**
3. Select:
   `manifest.json`
   from the extracted Firefox build folder.
4. Open:
   https://chatgpt.com
5. Hard-refresh:
   - macOS: `⌘ + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

### Important limitation

A Firefox extension loaded this way is **temporary**. After fully restarting Firefox, you may need to load it again through `about:debugging`.

For permanent installation, the extension must be signed and published through Mozilla Add-ons (AMO).

---

## 3. Safari

Safari Web Extensions are not installed using a Chrome-style “Load unpacked” flow. Safari requires a small host application built with Xcode.

### Option A — use the included Safari Xcode project

The repository includes a generated Safari wrapper under:

`safari-xcode/Craft Export for ChatGPT/`

1. Clone the repository or download the source.
2. Open:
   `Craft Export for ChatGPT.xcodeproj`
   in Xcode.
3. Select the scheme:
   **Craft Export for ChatGPT (macOS)**
4. Open the project settings and choose:
   **Signing & Capabilities**
5. For:
   **Craft Export for ChatGPT (macOS)**
   select your Apple Developer **Team**.
6. Check the:
   **Craft Export for ChatGPT Extension (macOS)**
   target as well.
7. Click **Run ▶**.
8. After the host app launches, open:
   **Safari → Settings → Extensions**
9. Enable:
   **Craft Export for ChatGPT**
10. Allow access to:
    `chatgpt.com`
11. Open ChatGPT and reload the page.

### Option B — regenerate the Safari wrapper

To regenerate the Safari wrapper from the current Chromium build:

```bash
npm run build

xcrun safari-web-extension-converter dist/chromium \
  --project-location safari-xcode \
  --app-name "Craft Export for ChatGPT" \
  --bundle-identifier "cz.urgentsolution.craftexport" \
  --copy-resources \
  --no-open
```

Then open the generated Xcode project and configure signing as described above.

### Safari distribution

For normal installation without Xcode, the host app must be signed and distributed through one of the supported Apple distribution channels, such as:

- Mac App Store,
- Developer ID,
- managed/internal distribution where appropriate.

---

## 4. Permissions and privacy

The extension needs access only to ChatGPT web domains so it can inject the export controls into the page.

The project:

- has no custom backend,
- does not send conversation content to its own server,
- uses no analytics or telemetry SDK,
- generates DOCX locally,
- uses the browser's local print workflow for PDF.

See:
- [PRIVACY.md](../PRIVACY.md)
- [SECURITY.md](../SECURITY.md)

---

## 5. Troubleshooting

### Buttons do not appear

Chrome:
- open `chrome://extensions`,
- click **Reload**,
- hard-refresh ChatGPT using `⌘/Ctrl + Shift + R`.

Firefox:
- verify the temporary add-on under `about:debugging#/runtime/this-firefox`,
- reload it if necessary,
- refresh ChatGPT.

Safari:
- confirm the extension is enabled under **Safari → Settings → Extensions**,
- confirm site access for `chatgpt.com`,
- relaunch the host application from Xcode when testing a development build.

### DOCX works but PDF does not

PDF export uses the browser print system. After clicking the PdfCraft action, the browser print dialog should open. Choose **Save as PDF** as the destination.

### Export filename

The extension attempts to derive the exported filename from the user prompt associated with the ChatGPT response. Invalid filename characters are removed automatically and excessively long names are shortened.

---

## 6. Security recommendation

Install development builds only from this repository or its Releases page. You can inspect the source code, manifests, and published SHA-256 checksums before loading the extension.
