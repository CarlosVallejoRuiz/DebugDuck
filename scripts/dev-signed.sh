#!/usr/bin/env bash
# dev-signed.sh
# Builds a proper .app bundle (required for SpeechRecognition TCC),
# signs it, and launches it.
#
# USAGE:
#   npm run dev:signed          ← first time or after code changes
#   npm run tauri dev           ← daily dev with HMR once permissions are granted
set -euo pipefail

BUNDLE="src-tauri/target/debug/bundle/macos/DebugDuck.app"
ENTITLEMENTS="src-tauri/entitlements.plist"
BUNDLE_ID="com.debugduck.app"

# 1 — Reset TCC for this app so the permission dialog appears fresh
echo "▶ Resetting TCC permissions for $BUNDLE_ID..."
tccutil reset Microphone "$BUNDLE_ID" 2>/dev/null || true
tccutil reset SpeechRecognition "$BUNDLE_ID" 2>/dev/null || true
echo "✓ TCC reset"

# 2 — Build the full .app bundle (runs npm run build + cargo internally)
#     First run ~2-3 min; subsequent runs ~30s (incremental)
echo "▶ Building .app bundle..."
npm run tauri build -- --debug
echo "✓ Bundle built at $BUNDLE"

# 3 — Sign the entire .app (--deep signs all nested binaries/frameworks)
echo "▶ Signing .app bundle..."
codesign --sign - --force --deep \
    --entitlements "$ENTITLEMENTS" \
    "$BUNDLE"
echo "✓ Signed"

# 4 — Launch — macOS will show the Microphone and Speech Recognition
#     permission dialogs on first double-click of the duck
echo "▶ Launching DebugDuck.app..."
open "$BUNDLE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Doble clic en el pato para activar"
echo "  el micrófono → aprueba ambos permisos."
echo "  Luego usa 'npm run tauri dev' para HMR."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
