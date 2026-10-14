# Security Policy

## Supported version

Security fixes target the latest release on the default branch.

## Reporting a vulnerability

Please do not publish a working exploit in a public issue.

Open a private GitHub security advisory for this repository if available, or contact the repository owner through GitHub.

Please include:

- affected browser and extension version;
- reproduction steps;
- expected and observed behavior;
- whether conversation content or local files can be exposed;
- whether the issue affects the Native Messaging bridge.

## Security model

The project intentionally uses a small, local-first architecture.

### Browser extension

The browser extension has:

- no project-operated cloud backend;
- no API keys;
- no analytics/telemetry SDK;
- no remote code loading;
- ChatGPT-only host permissions;
- a background script only for local Native Messaging dispatch;
- explicit user-triggered export actions.

### Native Messaging bridge

The optional macOS bridge:

- is installed explicitly by the user;
- is reachable only through the browser's Native Messaging mechanism;
- is registered only for the configured extension identity;
- writes exported files locally;
- opens locally installed WordCraft/PdfCraft applications;
- does not expose an unauthenticated public network service;
- does not upload document content to a project server.

### PdfCraft control channel

When opening generated PDFs, the bridge starts PdfCraft with its own authenticated loopback control channel only when required by the integration flow. PdfCraft supplies a per-launch token and binds to loopback. The bridge does not expose that token externally.

### WordCraft handoff

WordCraft documents are opened through the installed application bundle identifier on macOS. The bridge writes the DOCX locally first, then asks LaunchServices to open it with WordCraft and activates the application.

## Main risks

The main compatibility and security-sensitive areas are:

- **ChatGPT DOM drift** — the response toolbar is not a public extension API.
- **Native Messaging configuration** — the host manifest must remain scoped to the correct extension identity.
- **Local file writes** — filenames are sanitized and collision-safe names are used to avoid accidental overwrite.
- **Rendered-content scope** — export is limited to the assistant response selected by the user, plus the related prompt used for the filename.
- **Application handoff** — WordCraft/PdfCraft must already be installed locally.

## Development guidance

Security-sensitive changes should preserve:

- local-only processing;
- narrow host permissions;
- no remote code loading;
- explicit user action before export;
- safe filename handling;
- fail-closed Native Messaging registration;
- browser fallback when native integration is unavailable.

Project author: **[robertdominik618](https://github.com/robertdominik618)**.
