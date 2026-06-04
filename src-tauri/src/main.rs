// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Embed Info.plist directly into the Mach-O __TEXT,__info_plist section.
// Required for TCC (Privacy & Security) to find NSMicrophoneUsageDescription
// and NSSpeechRecognitionUsageDescription in dev mode, where the binary runs
// outside an app bundle and the codesign-embedded plist is the only signal
// macOS uses to authorize the privacy permission dialog.
#[cfg(target_os = "macos")]
embed_plist::embed_info_plist!("../Info.plist");

fn main() {
  app_lib::run();
}
