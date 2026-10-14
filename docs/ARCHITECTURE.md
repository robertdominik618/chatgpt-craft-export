# Architecture

## Design goals

1. Minimal browser privileges.
2. No network dependency.
3. No collection or transmission of ChatGPT conversation data.
4. Graceful failure when ChatGPT changes its DOM.
5. Standards-based exported files.
6. One source tree for Chromium, Firefox, and Safari conversion.

## Runtime

The content script watches for elements carrying `data-message-author-role="assistant"`. A `MutationObserver` schedules a scan when ChatGPT renders or replaces conversation nodes.

For each assistant message, the extension searches the surrounding article for a compact button row and appends its own `.craft-export-actions` container. If no action row can be found, it falls back to the message parent rather than modifying the message text itself.

## WordCraft / DOCX exporter

The exporter:

- clones and sanitizes the selected assistant message;
- maps rendered HTML blocks to WordprocessingML;
- builds a minimal OOXML package with document, styles, relationships, and document properties;
- writes a standards-compliant ZIP container using STORE entries and CRC-32;
- downloads the resulting Blob as `.docx`.

No runtime npm library is required.

### Current fidelity

Preserved in v0.1.0:

- H1-H6 headings (mapped to three document heading levels)
- paragraphs
- bold and italic text
- inline code
- fenced/rendered code blocks
- links as readable text plus URL
- ordered and unordered lists
- blockquotes
- basic tables
- horizontal separators
- Unicode text

Not yet preserved perfectly:

- nested list numbering semantics
- images
- equations
- syntax highlighting
- complex table spans
- footnotes and citations as structured Word fields

## PdfCraft / PDF exporter

WebExtensions do not have a portable, low-privilege API that silently renders arbitrary page HTML into a PDF file across Chrome, Firefox, and Safari.

The extension therefore creates a clean same-origin print document and invokes the normal browser print flow. The user selects the browser/OS **Save as PDF** destination. This provides:

- strong Unicode support;
- native font shaping;
- predictable A4 CSS;
- no debugger permission;
- no cloud conversion service;
- consistent cross-browser behavior.

## Security boundary

The extension has host access only to:

- `https://chatgpt.com/*`
- `https://chat.openai.com/*`

There is no background service worker and no external fetch. Export occurs only after a user click.

## Compatibility strategy

ChatGPT's DOM is not a public extension API. The implementation therefore avoids depending on hashed CSS classes. It anchors on the semantic assistant-role attribute and scores nearby button containers instead of hard-coding one layout class.

If OpenAI changes those semantic markers, an update may be required.
