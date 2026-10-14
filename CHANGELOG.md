# Changelog

## 0.2.9 - 2026-10-14

- Fixed `HierarchyRequestError` caused by the Adobe-action detector accidentally matching the Craft PdfCraft button itself.
- Adobe detection now explicitly prefers `.acrobat-chatgpt-response-convert-btn` and excludes elements inside `.craft-export-actions`.
- Added ancestor/descendant guards before toolbar re-parenting so the extension can never insert a parent into its own descendant tree.
- Rebuilt both Chromium and Firefox development packages.

## 0.2.8 - 2026-10-14

- Fixed Firefox async response handling for Native Messaging.
- Firefox now returns a Promise from `runtime.onMessage`, matching Firefox WebExtension semantics.
- Chrome keeps its callback + `return true` path unchanged.
- Rebuilt the Firefox development package with the current WordCraft/PdfCraft native bridge integration.

## 0.2.7 - 2026-10-14

Current working macOS integration release.

- WordCraft DOCX export now opens the generated document through the WordCraft bundle identifier.
- WordCraft is explicitly activated after the document is opened so the exported file is visible immediately.
- Native bridge fallback behavior remains available when direct desktop integration cannot be used.
- Chromium and Firefox builds remain supported from the same WebExtension source.

## 0.2.6 - 2026-10-14

- Fixed DOCX payload decoding in the macOS Native Messaging bridge.
- Verified native WordCraft handoff with a real generated DOCX.
- Added local DOCX persistence before desktop-app opening.

## 0.2.5 - 2026-10-14

- Added direct DOCX opening in WordCraft through the local Native Messaging bridge.
- Added browser-download fallback when WordCraft integration is unavailable.
- Updated WordCraft hover text for direct desktop opening.

## 0.2.4 - 2026-10-14

- Refined hover lifecycle.
- Tooltip text wraps to the corresponding button width.
- Added one Adobe-style separator per Craft action.
- Normalized compact toolbar styling.

## 0.2.3 - 2026-10-14

- Added reliable body-level tooltip rendering.
- Added guaranteed hover highlighting.
- Added Adobe-style vertical separator.
- Kept WordCraft direct DOCX export and PdfCraft direct-open workflow.

## 0.2.2 - 2026-10-14

- Isolated tooltip rendering from ChatGPT toolbar layout.
- Prevented tooltips from expanding or breaking the action row.
- Preserved direct PdfCraft opening without automatic print dialog.

## 0.2.1 - 2026-10-14

- Added Adobe-style hover highlighting.
- Added explanatory WordCraft/PdfCraft tooltips.
- PdfCraft now opens the generated PDF directly in PdfCraft without opening its Print dialog.
- WordCraft remained download-based at this stage.

## 0.2.0 - 2026-10-14

- Reworked interaction handling around ChatGPT's React toolbar.
- Craft actions now run on capture-phase `pointerdown` with click/keyboard fallback.
- Added duplicate-action protection and pressed-state feedback.

## 0.1.9 - 2026-10-14

- Hardened click hit targets.
- Added capture-phase click interception.
- Kept native PdfCraft bridge integration.

## 0.1.8 - 2026-10-14

- Added optional macOS Native Messaging bridge.
- Added background extension process for native messaging.
- Added local PDF generation and direct PdfCraft opening.
- Added Chrome/Firefox native-host installer.
- Added browser print fallback when native PdfCraft bridge is unavailable.

## 0.1.7 - 2026-10-14

- Fixed toolbar overlap.
- Prevented ChatGPT CSS from collapsing labeled Craft buttons.
- Positioned Craft controls after the complete Adobe action group.

## 0.1.6 - 2026-10-14

- Added visible Czech/English labels.
- Added prompt-derived filenames.
- Improved local PDF export flow.

## 0.1.5 - 2026-10-14

- Added official WordCraft and PdfCraft application icons from the upstream public repositories.
- Added attribution documentation.
- Matched Adobe icon sizing in the toolbar.

## 0.1.4 - 2026-10-14

- Updated ChatGPT DOM targeting for the current assistant-message markup.
- Anchored Craft actions beside the Adobe PDF control.

## 0.1.3 - 2026-10-14

- Improved ChatGPT toolbar placement.
- Added direct Adobe-action anchoring with fallback discovery.

## 0.1.2 - 2026-10-14

- Fixed visibility on the current ChatGPT UI.
- Moved injection away from brittle toolbar internals.

## 0.1.1 - 2026-10-14

- Added original extension icons in all required sizes.
- Added a generated Safari Web Extension Xcode wrapper for macOS/iOS.
- Validated the macOS Safari wrapper with an unsigned Xcode Debug build.
- Updated browser packages to include icons.

## 0.1.0 - 2026-10-14

Initial public release.

- Native-style actions below ChatGPT assistant responses.
- Real local OOXML DOCX generation for WordCraft.
- Clean browser print workflow for PdfCraft/PDF.
- Chrome/Chromium and Firefox manifests.
- Safari conversion instructions.
- Czech and English localization.
- Privacy-first runtime.

---

Project created and maintained by **[robertdominik618](https://github.com/robertdominik618)**.
