#!/bin/sh
set -eu

PROJECT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
NODE_BIN="$(command -v node)"
USER_HOME="$(dscl . -read /Users/$(id -un) NFSHomeDirectory | awk '{print $2}')"
PLIST="$USER_HOME/Library/LaunchAgents/com.incentive-atlas.public-data.plist"

mkdir -p "$USER_HOME/Library/LaunchAgents"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.incentive-atlas.public-data</string>
  <key>ProgramArguments</key><array><string>$NODE_BIN</string><string>$PROJECT_DIR/scripts/update-public-data.mjs</string></array>
  <key>WorkingDirectory</key><string>$PROJECT_DIR</string>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>$PROJECT_DIR/data/update.log</string>
  <key>StandardErrorPath</key><string>$PROJECT_DIR/data/update-error.log</string>
</dict></plist>
EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "Daily update installed for 06:00 local time: $PLIST"
