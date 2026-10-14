# Architecture

## Design goals

1. Minimal browser privileges.
2. Local-first document processing.
3. No project-operated cloud conversion service.
4. Graceful failure when ChatGPT changes its DOM.
5. Standards-based exported files.
6. Shared WebExtension source for Chromium and Firefox, plus a Safari Web Extension wrapper.
7. Optional native desktop integration through explicit Native Messaging.

## Browser runtime

The content script targets current ChatGPT assistant-message markup using semantic selectors such as:

`[data-markdown-text-style="assistant-message"]`

A `MutationObserver` rescans the page when ChatGPT renders or replaces conversation nodes.

For each assistant response, the extension finds the corresponding ChatGPT action row, recognizes the Adobe PDF action when present, and inserts its own Craft controls in the same toolbar.

The toolbar integration includes:

- WordCraft and PdfCraft application icons;
- separate Adobe-style separators;
- hover highlighting;
- body-level hover tooltip rendering so ChatGPT CSS cannot expand the toolbar;
- keyboard focus support;
- pointer-down capture handling to avoid clicks being swallowed when React rerenders the toolbar;
- click/keyboard fallbacks and de-duplication.

## Prompt-to-filename mapping

The extension resolves the user prompt associated with the selected assistant response and derives the exported filename from it.

The filename layer:

- sanitizes filesystem-invalid characters;
- normalizes whitespace;
- limits length;
- uses a fallback name when no prompt can be resolved;
- lets the native bridge avoid overwriting existing files by adding numeric suffixes.

## WordCraft / DOCX exporter

The DOCX exporter:

- clones and sanitizes the selected assistant message;
- maps rendered HTML blocks to WordprocessingML;
- builds a minimal OOXML package with document, styles, relationships, and document properties;
- writes a standards-compliant ZIP container with CRC-32;
- creates a real `.docx` Blob locally in the browser.

No cloud conversion service is needed.

### Current DOCX fidelity

Preserved:

- headings;
- paragraphs;
- bold and italic text;
- inline code;
- code blocks;
- ordered and unordered lists;
- blockquotes;
- basic tables;
- horizontal separators;
- links as readable text plus URL;
- Unicode text.

Not yet preserved perfectly:

- complex nested list numbering;
- equations as native Word equations;
- complex table spans;
- structured footnotes/citations;
- every embedded image;
- full syntax highlighting.

## WordCraft native opening on macOS

When the native bridge is available, the content script passes the generated DOCX bytes to the background extension process, which forwards them over Native Messaging.

The native bridge then:

1. decodes the DOCX payload;
2. writes it to `~/Downloads` using a collision-safe filename;
3. opens the document with bundle identifier `ai.storyteller.wordcraft`;
4. activates WordCraft so the document is visible immediately.

If the bridge is unavailable, the browser falls back to a normal DOCX download.

## PdfCraft / PDF exporter

The content script creates a clean printable HTML representation of the selected ChatGPT response.

When the native bridge is available:

1. the browser background process forwards the printable document through Native Messaging;
2. the bridge writes a temporary HTML file;
3. a local Chromium binary renders that HTML to PDF in headless mode;
4. the PDF is written to `~/Downloads`;
5. PdfCraft is launched with the generated PDF.

The extension does **not** automatically open PdfCraft's Print dialog.

If the bridge is unavailable, the extension falls back to an in-browser print/PDF workflow.

## Native Messaging layer

Relevant files:

- `src/background.js`
- `native/pdfcraft_bridge.py`
- `native/install_macos.sh`

The historical bridge filename contains PdfCraft, but it now handles both WordCraft and PdfCraft actions.

The extension background receives two message families:

- `craft-export-word` → `wordcraft.open`
- `craft-export-pdf` → `pdfcraft.open`

The macOS installer registers Native Messaging hosts for Chrome-compatible browsers and Firefox.

The bridge:

- is local to the user's computer;
- is invoked by the browser Native Messaging mechanism;
- does not expose a public web API;
- does not use a project cloud backend;
- writes generated files locally;
- opens locally installed desktop applications.

## Browser manifests

### Chromium

Manifest V3 uses:

- content script;
- CSS;
- service-worker background script;
- `nativeMessaging` permission;
- ChatGPT host permissions;
- web-accessible WordCraft/PdfCraft icons.

### Firefox

Manifest V3 uses:

- content script;
- CSS;
- background script;
- Gecko extension ID;
- `nativeMessaging` permission;
- ChatGPT host permissions.

### Safari

The repository includes a generated Safari Web Extension Xcode wrapper under `safari-xcode/`.

The Safari wrapper shares the WebExtension UI code, but production Native Messaging / desktop-app handoff requires Safari-specific signing and entitlement validation before being treated as equivalent to the current Chrome/Firefox macOS path.

## Security boundary

Browser host access is limited to:

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

The native bridge is not a remote service. Export actions are initiated explicitly by the user.

Native files are written to the user's local `Downloads` directory. Bridge errors are logged locally under:

`~/Library/Logs/Craft Export for ChatGPT/`

## Compatibility strategy

ChatGPT's DOM is not a public extension API.

The implementation therefore avoids relying solely on generated CSS class names. It combines semantic message markers, dynamic action-row discovery, Adobe-action recognition, DOM observation, and reinjection/repositioning.

If OpenAI changes the relevant semantic markers or response-toolbar structure, the integration may need an update.
