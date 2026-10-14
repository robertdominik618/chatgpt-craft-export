#!/bin/zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_SUPPORT="$HOME/Library/Application Support/Craft Export for ChatGPT"
HOST="$APP_SUPPORT/pdfcraft_bridge.py"
HOST_NAME="cz.urgentsolution.craftexport.pdfcraft"

mkdir -p "$APP_SUPPORT"
cp "$ROOT/native/pdfcraft_bridge.py" "$HOST"
chmod 755 "$HOST"

CHROME_ID="${CRAFT_EXPORT_CHROME_ID:-}"
if [[ -z "$CHROME_ID" ]]; then
  SECURE_PREFS="$HOME/Library/Application Support/Google/Chrome/Default/Secure Preferences"
  if [[ -f "$SECURE_PREFS" ]]; then
    CHROME_ID="$(python3 - "$SECURE_PREFS" <<'PY'
import json, sys
p=sys.argv[1]
try:
    d=json.load(open(p))
except Exception:
    raise SystemExit
for ext_id, cfg in d.get("extensions",{}).get("settings",{}).items():
    path=str(cfg.get("path","")).lower()
    if "craft-export-chromium" in path or "chatgpt-craft-export" in path:
        print(ext_id)
        break
PY
)"
  fi
fi

if [[ -n "$CHROME_ID" ]]; then
  CHROME_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
  mkdir -p "$CHROME_DIR"
  cat > "$CHROME_DIR/$HOST_NAME.json" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Local bridge from Craft Export for ChatGPT to PdfCraft",
  "path": "$HOST",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$CHROME_ID/"]
}
EOF
  echo "Chrome native host installed for extension ID: $CHROME_ID"
else
  echo "Warning: Chrome extension ID was not detected."
  echo "Set CRAFT_EXPORT_CHROME_ID=<extension-id> and run this script again."
fi

FIREFOX_DIR="$HOME/Library/Application Support/Mozilla/NativeMessagingHosts"
mkdir -p "$FIREFOX_DIR"
cat > "$FIREFOX_DIR/$HOST_NAME.json" <<EOF
{
  "name": "$HOST_NAME",
  "description": "Local bridge from Craft Export for ChatGPT to PdfCraft",
  "path": "$HOST",
  "type": "stdio",
  "allowed_extensions": ["craft-export-for-chatgpt@robertdominik618.github.io"]
}
EOF

echo "Firefox native host installed."
echo "PdfCraft bridge: $HOST"
echo "Restart/reload the browser extension after installation."
