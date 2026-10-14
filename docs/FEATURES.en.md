# Feature Reference — Craft Export for ChatGPT

Created and maintained by **[robertdominik618](https://github.com/robertdominik618)**.

This document describes the currently implemented behavior of Craft Export for ChatGPT.

## 1. ChatGPT toolbar integration

The extension injects two actions into the response toolbar for ChatGPT assistant messages:

- **WordCraft — Convert to DOC**
- **PdfCraft — Convert to PDF**

The controls are designed to visually fit next to ChatGPT and Adobe response actions.

Implemented UI behavior:

- official WordCraft and PdfCraft application icons;
- separate Adobe-style vertical separators for both Craft actions;
- native-style 32 px toolbar controls;
- hover highlighting;
- explanatory hover tooltip shown only while the pointer is over the corresponding button;
- keyboard focus support;
- pointer-down capture handling so ChatGPT/React rerenders do not swallow clicks;
- click and keyboard fallbacks with duplicate-action protection.

## 2. Automatic filenames from the prompt

Both DOCX and PDF exports derive their filename from the **user prompt associated with the selected assistant response**.

The filename logic:

- uses the prompt text when available;
- removes filesystem-invalid characters;
- collapses excessive whitespace;
- limits very long names;
- uses a safe fallback if the prompt cannot be resolved;
- avoids overwriting existing files by adding a numeric suffix where the native bridge writes a file.

Example:

`Explain the DCF valuation of a manufacturing company`

can produce:

`Explain the DCF valuation of a manufacturing company.docx`

or:

`Explain the DCF valuation of a manufacturing company.pdf`

## 3. WordCraft — Convert to DOC

The WordCraft action creates a real standards-based **OOXML DOCX** file.

### Local DOCX generation

DOCX generation happens locally in the browser. The extension creates the ZIP-based OOXML package itself without a cloud conversion service.

The current exporter preserves readable versions of:

- headings;
- paragraphs;
- bold and italic text;
- inline code;
- code blocks;
- ordered lists;
- unordered lists;
- blockquotes;
- basic tables;
- horizontal separators;
- links;
- Unicode text, including Czech.

### Native WordCraft opening on macOS

When the optional local Native Messaging bridge is installed:

1. the DOCX is generated in the extension;
2. the DOCX bytes are passed locally to the native bridge;
3. the bridge saves the file in `~/Downloads`;
4. the bridge opens the file with the WordCraft bundle identifier `ai.storyteller.wordcraft`;
5. WordCraft is explicitly activated and brought to the foreground.

If WordCraft or the native bridge is unavailable, the extension falls back to a normal DOCX browser download.

## 4. PdfCraft — Convert to PDF

The PdfCraft action creates a real PDF from the selected ChatGPT answer.

### Native PdfCraft opening on macOS

When the optional Native Messaging bridge is installed:

1. the selected response is converted into a clean printable HTML document;
2. a local Chromium engine renders that HTML to PDF in headless mode;
3. the PDF is written locally to `~/Downloads`;
4. the bridge starts PdfCraft with the generated PDF;
5. PdfCraft opens the document.

The extension **does not automatically open the PdfCraft Print dialog**.

If the native bridge is unavailable, the extension falls back to the browser print/PDF workflow.

## 5. Native Messaging bridge

The optional macOS bridge is implemented in:

- `native/pdfcraft_bridge.py`
- `native/install_macos.sh`

Despite the historical filename, the bridge currently serves both **WordCraft and PdfCraft**.

The installer registers Native Messaging hosts for:

- Google Chrome / Chromium-compatible installation flow;
- Firefox.

The bridge:

- runs locally on the user's Mac;
- does not expose a public network service;
- receives only explicit export requests from the extension;
- writes generated files locally;
- opens WordCraft/PdfCraft through installed desktop applications;
- logs errors locally under `~/Library/Logs/Craft Export for ChatGPT/`.

## 6. Privacy model

The project is local-first.

It does not include:

- project-operated cloud conversion;
- analytics SDKs;
- ad tracking;
- telemetry uploads;
- remote execution services.

The extension reads only the rendered assistant response selected for export and the corresponding user prompt needed for the filename.

When a native bridge action is used, the relevant document representation is transferred locally from the browser extension to the Native Messaging host on the same computer.

## 7. Browser support

### Chrome / Chromium / Edge

- Manifest V3 build.
- Development installation with `Load unpacked`.
- Native Messaging supported on macOS.
- Direct WordCraft and PdfCraft desktop opening supported when the bridge is installed.

### Firefox

- Manifest V3 build with Gecko extension ID.
- Temporary development installation through `about:debugging`.
- Native Messaging host installation is included for macOS.

### Safari

- Safari Web Extension Xcode wrapper included in `safari-xcode/`.
- Requires Xcode signing for normal Safari installation/distribution.
- Browser extension UI is based on the same WebExtension codebase.
- Native desktop bridge integration may require Safari-specific signing/entitlement work before production distribution.

## 8. Compatibility strategy

ChatGPT's response toolbar is not a public extension API and can change.

The extension therefore:

- anchors on semantic assistant-message markers where available;
- observes DOM changes with `MutationObserver`;
- locates the native ChatGPT action row dynamically;
- recognizes the Adobe PDF action when present;
- reinjects/moves Craft actions when ChatGPT rerenders the toolbar;
- uses capture-phase pointer handling to avoid swallowed clicks.

## 9. Current limitations

The DOCX exporter does not yet perfectly preserve:

- nested numbering semantics;
- equations as native Word equations;
- complex table spans;
- structured citations/footnotes;
- all embedded images;
- full syntax highlighting.

Native desktop opening currently targets macOS installations of WordCraft and PdfCraft.

## 10. Project author

Craft Export for ChatGPT was created by **[robertdominik618](https://github.com/robertdominik618)**.
