# Outreach to the ArtCraft / Storytold maintainers

## Suggested GitHub issue / discussion

**Title:** Community integration: WordCraft + PdfCraft export actions for ChatGPT

Hi ArtCraft team,

I built a small open-source browser extension that adds two actions directly below ChatGPT responses:

- **Convert to WordCraft (.docx)** — generates a genuine OOXML DOCX locally in the browser.
- **Convert to PdfCraft (.pdf)** — opens a clean print view for saving through the browser's native PDF workflow.

Repository: https://github.com/robertdominik618/chatgpt-craft-export

The goal is intentionally narrow: make it easier to move an AI-generated draft into open creative tools without sending the conversation through another cloud service.

A few implementation details that may be relevant to you:

- Chromium + Firefox WebExtension builds from one dependency-free codebase.
- Safari source is supported through Apple's Safari Web Extension Converter.
- No telemetry, backend, API keys, or remote content processing.
- No ArtCraft/WordCraft/PdfCraft logos or bundled brand assets; the names are used only to identify the target apps.
- DOCX is standards-based OOXML rather than HTML renamed to .doc.
- PDF uses the browser print pipeline to preserve Unicode and avoid intrusive browser debugging permissions.

If WordCraft or PdfCraft gains a stable deep-link, browser handoff, local protocol, WebAssembly API, or MCP command intended for third-party integrations, I would be very interested in wiring the buttons into a true “open directly in WordCraft/PdfCraft” workflow.

Feedback on naming, interoperability, preferred file handoff, or a better integration point is very welcome.

Thanks for building these tools.

— robertdominik618
