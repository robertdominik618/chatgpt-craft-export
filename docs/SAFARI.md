# Safari build

A generated Xcode wrapper is committed in `safari-xcode/`. It was validated with an unsigned local macOS Debug build on 2026-10-14. Public distribution still requires Apple signing.

Safari Web Extensions use the WebExtension source but require an Apple Xcode host application for signing and distribution.

## Prerequisites

- macOS
- Xcode
- Apple command-line tools
- an Apple Developer account for signed distribution

## Build

```bash
npm run build
mkdir -p safari
xcrun safari-web-extension-converter dist/chromium \
  --project-location safari \
  --app-name "Craft Export for ChatGPT" \
  --bundle-identifier "cz.urgentsolution.craftexport" \
  --copy-resources
```

Open the generated Xcode project, select your signing team, build the macOS host app, then enable the extension in **Safari > Settings > Extensions**.

For public distribution, use Apple's normal App Store / Developer ID workflow. The repository does not contain signing certificates or provisioning profiles.
