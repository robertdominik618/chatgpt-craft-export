# Privacy Policy

Craft Export for ChatGPT is designed as a **local-first** browser extension.

## Data collection

The project does **not** collect, sell, transmit, or store analytics about the user or their conversations.

There is:

- no analytics SDK;
- no advertising tracker;
- no project-operated cloud conversion service;
- no telemetry upload implemented by this project.

## Conversation content

When the user presses an export action, the extension reads the rendered content of that specific ChatGPT response for the purpose of creating the requested local document.

It may also read the associated user prompt in order to derive a useful filename.

### DOCX / WordCraft

- DOCX generation happens locally in JavaScript.
- With the optional macOS Native Messaging bridge enabled, the generated DOCX bytes are transferred locally from the browser extension to the native host on the **same computer**.
- The bridge writes the DOCX to the user's local `Downloads` folder and opens it in WordCraft.
- If the bridge is unavailable, the extension falls back to a normal browser download.

### PDF / PdfCraft

- The selected response is converted to a local printable representation.
- With the optional macOS Native Messaging bridge enabled, that representation is transferred locally to the native host on the same computer.
- A local Chromium executable renders the PDF.
- The bridge writes the PDF to `Downloads` and opens it in PdfCraft.
- If the bridge is unavailable, the extension falls back to a browser-local print/PDF workflow.

## Native Messaging

The optional Native Messaging bridge runs locally on the user's computer.

Relevant files:

- `native/pdfcraft_bridge.py`
- `native/install_macos.sh`

The bridge does not expose a public web service and is not a project cloud backend.

## Network requests

The extension does not intentionally send exported conversation content to a project-operated external server.

Normal browser, ChatGPT, WordCraft, PdfCraft, operating-system, extension-store, and update traffic is governed by those products' own behavior and privacy policies.

## Permissions

The browser extension requests:

- access to ChatGPT web domains so it can insert and operate the export controls;
- `nativeMessaging` when the build supports the optional local desktop bridge.

## Local files

When native desktop integration is enabled, exported DOCX and PDF files are written locally, normally under:

`~/Downloads`

Bridge errors may be logged locally under:

`~/Library/Logs/Craft Export for ChatGPT/`

## Third parties

ChatGPT, OpenAI, WordCraft, PdfCraft, ArtCraft, Microsoft, Adobe, browser vendors, and the operating system have their own privacy practices.

Craft Export for ChatGPT is an independent community project created by **[robertdominik618](https://github.com/robertdominik618)**.
