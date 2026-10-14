# Security Policy

## Supported version

Security fixes are targeted at the latest release on the default branch.

## Reporting a vulnerability

Please do not publish a working exploit in a public issue. Open a private GitHub security advisory for this repository if available, or contact the repository owner through GitHub.

Please include:

- affected browser and extension version;
- reproduction steps;
- expected and observed behavior;
- whether conversation content or local files can be exposed.

## Security model

The project intentionally has:

- no backend;
- no API keys;
- no telemetry;
- no remote code loading;
- no background service worker;
- narrow ChatGPT host permissions.

The main compatibility risk is DOM drift on ChatGPT. The main data-safety risk is accidental inclusion of unwanted rendered content in an export; export is therefore scoped to the assistant message whose button was pressed.
