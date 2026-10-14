# Craft Export for ChatGPT

**Craft Export for ChatGPT** is an open-source browser extension that adds dedicated **WordCraft** and **PdfCraft** export actions directly to the response toolbar in ChatGPT.

Created and maintained by **[robertdominik618](https://github.com/robertdominik618)**.

> Community project. Not affiliated with or endorsed by OpenAI, Adobe, ArtCraft, WordCraft, or PdfCraft.

## What the buttons do

The extension adds two actions beside the existing ChatGPT response controls, with application icons, separators, hover highlighting, and explanatory tooltips.

### WordCraft — Convert to DOC

**WordCraft · Convert to DOC** exports the selected ChatGPT answer as a real standards-based OOXML `.docx` document.

- The DOCX is generated locally.
- The filename is automatically derived from the user prompt associated with that answer.
- Invalid filename characters are removed and long names are shortened.
- With the optional macOS Native Messaging bridge installed, the DOCX is saved locally and opened automatically in **WordCraft.app**.
- WordCraft is explicitly activated so the exported document becomes visible immediately.
- If the bridge is unavailable, the extension falls back to a normal DOCX browser download.
- The exported document preserves common structure such as headings, paragraphs, emphasis, lists, code blocks, blockquotes, tables, links, and Unicode text.

### PdfCraft — Convert to PDF

**PdfCraft · Convert to PDF** creates a real PDF from the selected ChatGPT answer and, when the optional local macOS bridge is installed, opens the generated PDF directly in the **PdfCraft** desktop application.

- The filename is automatically derived from the associated user prompt.
- The PDF is saved locally, normally in `Downloads`.
- On macOS, the optional native bridge opens the generated PDF directly in `PdfCraft.app`.
- The PdfCraft Print dialog is **not** opened automatically.
- If the native bridge is unavailable, the extension falls back to the browser's local print/PDF workflow.
- No cloud conversion service is required.

## Toolbar experience

The Craft actions are designed to sit next to the existing ChatGPT/Adobe response actions.

- official WordCraft and PdfCraft application icons;
- compact native-style controls;
- Adobe-style separators;
- hover highlighting;
- explanatory text appears only while hovering or focusing the corresponding button.

## Why DOCX instead of legacy DOC?

WordCraft's documented workflow reads and writes `.docx` natively. The extension therefore produces a genuine OOXML document rather than HTML renamed to `.doc`. This is more reliable across WordCraft, Microsoft Word, LibreOffice, and other compatible editors.

## Supported browsers

| Browser | Status | Notes |
| --- | --- | --- |
| Chrome / Chromium / Edge | Ready | Manifest V3 build; macOS native PdfCraft bridge supported |
| Firefox | Ready | Manifest V3 + Gecko ID; native bridge installer included for macOS |
| Safari | Xcode wrapper included | Safari Web Extension project is included under `safari-xcode/`; signing is required for normal distribution |

## Complete feature reference

- [English feature reference](docs/FEATURES.en.md)
- [Český přehled funkcí](docs/FEATURES.cs.md)

## Installation guides

- [English installation guide — Chrome, Firefox, Safari](docs/INSTALLATION.en.md)
- [Český instalační manuál — Chrome, Firefox, Safari](docs/INSTALLATION.cs.md)

## Quick start

### Chrome / Chromium / Edge

```bash
git clone https://github.com/robertdominik618/chatgpt-craft-export.git
cd chatgpt-craft-export
npm run build
```

Open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `dist/chromium`.

On macOS, install the optional local desktop bridge for **both WordCraft and PdfCraft** with:

```bash
./native/install_macos.sh
```

Then reload the extension and hard-refresh ChatGPT.

### Firefox

```bash
npm run build
```

Open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select `dist/firefox/manifest.json`.

On macOS, `./native/install_macos.sh` also installs the Firefox Native Messaging host used for direct WordCraft and PdfCraft opening.

### Safari

Follow [docs/SAFARI.md](docs/SAFARI.md). Safari requires Apple's Safari Web Extension / Xcode signing workflow.

## Architecture

The browser extension observes rendered assistant responses and adds the two Craft export actions to the ChatGPT response toolbar.

The **DOCX path** builds a standards-based OOXML package locally in the browser. With the native bridge installed, the document is written to `Downloads`, opened through the WordCraft bundle identifier, and WordCraft is activated.

The **PDF path** sends the printable representation to a local Native Messaging bridge when available. On macOS, that bridge renders a PDF locally, saves it to the user's computer, and opens the file in the installed PdfCraft application. The bridge communicates only on the local machine and does not use a remote conversion service.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for implementation details.

## Privacy

Craft Export for ChatGPT is designed for local processing.

- no analytics SDK;
- no advertising or tracking;
- no project-operated cloud conversion service;
- DOCX generation is local in the browser;
- PdfCraft integration uses an optional local Native Messaging bridge on the user's own computer.

The extension necessarily reads the rendered ChatGPT answer that the user chooses to export. With the native PdfCraft bridge enabled, the printable representation is passed locally from the browser extension to the bridge process on the same computer.

See [PRIVACY.md](PRIVACY.md).

## Development

```bash
npm test
npm run build
```

The extension runtime remains intentionally small, and the project includes browser builds plus the optional macOS WordCraft/PdfCraft bridge.

## Project author

This project was created by **[robertdominik618](https://github.com/robertdominik618)**.

The goal is to make moving useful ChatGPT output into open document tools fast, visible, and local-first.

## ArtCraft / Storytold outreach

The project includes an English outreach note for the ArtCraft/Storytold maintainers in [docs/STORYTOLD_OUTREACH.md](docs/STORYTOLD_OUTREACH.md).

WordCraft and PdfCraft names and application icons are used to identify the target applications. Their marks remain the property of their respective owners; see [ATTRIBUTION.md](ATTRIBUTION.md).

## License

MIT. See [LICENSE](LICENSE).
