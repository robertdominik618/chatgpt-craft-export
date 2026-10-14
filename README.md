# Craft Export for ChatGPT

A small, privacy-first browser extension that adds **WordCraft** and **PdfCraft** export actions directly to the action row below ChatGPT responses.

> Community project. Not affiliated with or endorsed by OpenAI, ArtCraft, WordCraft, PdfCraft, Microsoft, or Adobe.

## What it does

- **Convert to WordCraft (.docx)** — creates a real standards-based OOXML `.docx` file locally in the browser.
- **Convert to PdfCraft (.pdf)** — opens a clean, print-ready view so the browser can save the response as a PDF.
- Injects the controls next to ChatGPT's existing response actions, using a compact native-style UI.
- Works locally: no analytics, no external API, no server, no upload of conversation content.
- English and Czech localization included.
- Shared WebExtension codebase for Chromium, Firefox, and Safari conversion.

## Why DOCX instead of legacy DOC?

WordCraft's current documented workflow reads and writes `.docx` natively. This project therefore emits a genuine OOXML document rather than disguising HTML as a `.doc` file. That keeps the export standards-based and more reliable across WordCraft, Microsoft Word, LibreOffice, and other editors.

## Supported browsers

| Browser | Status | Notes |
| --- | --- | --- |
| Chrome / Chromium / Edge | Ready | Manifest V3 build |
| Firefox | Ready | Manifest V3 + Gecko ID |
| Safari | Xcode wrapper included | Generated Safari Web Extension project is included under `safari-xcode/`; signing is still required for distribution |

## Quick start

### Chromium

```bash
git clone https://github.com/robertdominik618/chatgpt-craft-export.git
cd chatgpt-craft-export
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `dist/chromium`.

### Firefox

```bash
npm run build
```

Open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `dist/firefox/manifest.json`.

### Safari

Build the Chromium target first, then follow [docs/SAFARI.md](docs/SAFARI.md). Safari requires Apple's Xcode conversion/signing flow.

## Architecture

The extension intentionally keeps privileges narrow. A content script observes rendered assistant messages, attaches two actions, and exports only the response whose button the user presses.

The DOCX path creates the minimum OOXML package directly in the browser and stores it as a ZIP container without third-party runtime dependencies. It preserves headings, paragraphs, emphasis, code blocks, lists, blockquotes, tables, and links as readable document content.

The PDF path uses the browser's own print engine. This avoids invasive debugging/printing permissions and gives the user a normal Save as PDF workflow with native font and Unicode handling.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for implementation details and compatibility assumptions.

## Privacy

Conversation text never leaves the browser because of this extension. There are no network calls, telemetry SDKs, analytics pixels, or remote services. See [PRIVACY.md](PRIVACY.md).

## Development

```bash
npm test
npm run build
```

The project currently has no runtime dependencies.

## Roadmap

- Store-ready signed packages for Chrome Web Store and Firefox Add-ons.
- Safari Xcode wrapper and App Store signing.
- Optional full-conversation export.
- Better preservation of complex Markdown, nested lists, math, and images.
- Optional direct handoff when WordCraft/PdfCraft expose a stable browser/deep-link protocol or WebAssembly API suitable for third-party integrations.
- Automated UI compatibility checks against ChatGPT DOM changes.

## ArtCraft / Storytold outreach

The project includes a concise English outreach note for the ArtCraft maintainers in [docs/STORYTOLD_OUTREACH.md](docs/STORYTOLD_OUTREACH.md). The extension uses the WordCraft and PdfCraft names only to identify the target applications and does not bundle their trademarks or logos.

## License

MIT. See [LICENSE](LICENSE).
