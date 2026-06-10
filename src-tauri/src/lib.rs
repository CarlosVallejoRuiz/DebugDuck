/// Toggles WKWebView cursor-event passthrough.
/// When `ignore` is true, cursor events fall through to whatever app is below.
#[tauri::command]
fn set_ignore_cursor(window: tauri::WebviewWindow, ignore: bool) -> Result<(), String> {
    window.set_ignore_cursor_events(ignore).map_err(|e| e.to_string())
}

/// Opens a dedicated full-screen transparent overlay window that runs the
/// confetti animation, then auto-closes after 2 s. The main widget window
/// is never resized or moved.
#[tauri::command]
async fn launch_confetti_window(app: tauri::AppHandle) -> Result<(), String> {
    use tauri::Manager;

    // Each invocation gets a unique label so there's no "window already exists"
    // conflict when the user hits Eureka multiple times.
    let label = format!(
        "confetti-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis()
    );

    // Get primary monitor size through the main window.
    let main_win = app
        .get_webview_window("main")
        .ok_or_else(|| "main window not found".to_string())?;
    let monitor = main_win
        .primary_monitor()
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "no primary monitor".to_string())?;
    let phys  = monitor.size();
    let scale = monitor.scale_factor();
    let w     = phys.width  as f64 / scale;
    let h     = phys.height as f64 / scale;

    let confetti_win = tauri::WebviewWindowBuilder::new(
        &app,
        label,
        tauri::WebviewUrl::App("confetti.html".into()),
    )
    .title("confetti")
    .inner_size(w, h)
    .position(0.0, 0.0)
    .transparent(true)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .build()
    .map_err(|e| e.to_string())?;

    // Pass all cursor events through — overlay never blocks the system.
    confetti_win
        .set_ignore_cursor_events(true)
        .map_err(|e| e.to_string())?;

    // Auto-close via the cloned window handle after the animation finishes.
    let win = confetti_win.clone();
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(2200));
        win.close().ok();
    });

    Ok(())
}

/// Streams an LM Studio chat completion and emits each text delta to the
/// frontend as a `stream-chunk` event, followed by a `stream-done` event
/// carrying the full accumulated content. This sidesteps the CORS restriction
/// that blocks native fetch in WKWebView when origin is tauri://localhost.
#[tauri::command]
async fn stream_lm_studio(
    window: tauri::WebviewWindow,
    messages: serde_json::Value,
    model: String,
    max_tokens: u32,
) -> Result<(), String> {
    use tauri::Emitter;

    let client = reqwest::Client::new();
    let body   = serde_json::json!({
        "model":       model,
        "messages":    messages,
        "max_tokens":  max_tokens,
        "temperature": 0.7,
        "stream":      true
    });

    let mut response = client
        .post("http://localhost:1234/v1/chat/completions")
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let mut full_content = String::new();

    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        let text = String::from_utf8_lossy(&chunk);
        for line in text.lines() {
            if !line.starts_with("data: ") { continue }
            let data = &line[6..];
            if data == "[DONE]" {
                window.emit("stream-done", &full_content).map_err(|e| e.to_string())?;
                return Ok(());
            }
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(data) {
                if let Some(delta) = parsed["choices"][0]["delta"]["content"].as_str() {
                    if !delta.is_empty() {
                        full_content.push_str(delta);
                        window.emit("stream-chunk", delta).map_err(|e| e.to_string())?;
                    }
                }
            }
        }
    }

    window.emit("stream-done", &full_content).map_err(|e| e.to_string())?;
    Ok(())
}

/// Opens the DebugDuck Arcade window (400×520).
/// `personality_mode` is forwarded as a URL query param so games.html can
/// adapt quiz/typing/wordle/bughunt content to "programmer" or "general".
/// If the window is already open, close it and reopen with the current mode.
#[tauri::command]
async fn launch_games_window(
    app: tauri::AppHandle,
    personality_mode: String,
) -> Result<(), String> {
    use tauri::Manager;

    if let Some(existing) = app.get_webview_window("games") {
        existing.close().map_err(|e| e.to_string())?;
        // Small delay so the window is fully destroyed before recreating
        std::thread::sleep(std::time::Duration::from_millis(120));
    }

    let url = format!("games.html?mode={}", personality_mode);

    tauri::WebviewWindowBuilder::new(
        &app,
        "games",
        tauri::WebviewUrl::App(url.into()),
    )
    .title("DebugDuck Arcade")
    .inner_size(400.0, 520.0)
    .resizable(false)
    .always_on_top(true)
    .center()
    .decorations(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Called by games.html when a game session ends.
/// Emits a `game-result` event to the main window, then closes the games window.
#[tauri::command]
async fn finish_game(
    app: tauri::AppHandle,
    completed: bool,
    won: bool,
    game: String,
) -> Result<(), String> {
    use tauri::{Emitter, Manager};

    if let Some(main_win) = app.get_webview_window("main") {
        main_win
            .emit(
                "game-result",
                serde_json::json!({ "completed": completed, "won": won, "game": game }),
            )
            .map_err(|e| e.to_string())?;
    }

    if let Some(games_win) = app.get_webview_window("games") {
        games_win.close().map_err(|e| e.to_string())?;
    }

    Ok(())
}

/// Sends a 128×128 pixel-art PNG to the local LM Studio model for sarcastic scoring.
/// Requires a vision-capable model loaded in LM Studio (e.g. llava, qwen-vl).
/// Returns a JSON string: {"score": 0-100, "comment": "..."}
#[tauri::command]
async fn score_pixel_art(base64_image: String, topic: String) -> Result<String, String> {
    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "model": "local-model",
        "max_tokens": 150,
        "messages": [{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": format!("data:image/png;base64,{}", base64_image)
                    }
                },
                {
                    "type": "text",
                    "text": format!(
                        "Eres un crítico de arte pixel sarcástico. \
                        El usuario intentó dibujar \"{}\" en un grid de 16x16 píxeles. \
                        Responde SOLO con este formato JSON sin markdown: \
                        {{\"score\": 0-100, \"comment\": \"comentario sarcástico en español máximo 15 palabras\"}} \
                        Sé honesto y gracioso.",
                        topic
                    )
                }
            ]
        }]
    });

    let response = client
        .post("http://localhost:1234/v1/chat/completions")
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let data: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    let content = data["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("{\"score\": 42, \"comment\": \"No tengo palabras. Y eso es mucho decir.\"}");

    Ok(content.to_string())
}

/// Returns cursor position in logical pixels relative to the window's top-left.
/// Uses Rust/OS APIs so it works even when cursor events are being ignored by WKWebView.
#[tauri::command]
fn get_cursor_pos(window: tauri::WebviewWindow) -> (f64, f64) {
    let pos = window.cursor_position().unwrap_or_default();
    let scale = window.scale_factor().unwrap_or(1.0);
    let win_pos = window.outer_position().unwrap_or_default();
    (
        (pos.x - win_pos.x as f64) / scale,
        (pos.y - win_pos.y as f64) / scale,
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![set_ignore_cursor, get_cursor_pos, launch_confetti_window, stream_lm_studio, launch_games_window, finish_game, score_pixel_art])
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_notification::init())
    .on_window_event(|window, event| {
      // Only prevent close on the main widget — all other windows (games, confetti, …)
      // are allowed to close normally.
      if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        if window.label() == "main" {
          api.prevent_close();
        }
      }
    })
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Fix double-click-to-close — must run synchronously BEFORE the event loop
      // starts, so it's applied before any user interaction.
      #[cfg(target_os = "macos")]
      disable_movable_by_window_background();

      // Position the widget at the bottom-right corner on startup,
      // with a margin that clears the macOS Dock (≈80 px).
      {
        use tauri::Manager;
        let win = app.get_webview_window("main").unwrap();
        if let Ok(Some(monitor)) = win.current_monitor() {
          if let Ok(win_size) = win.outer_size() {
            let mon = monitor.size();
            let x = mon.width  as i32 - win_size.width  as i32 - 16;
            let y = mon.height as i32 - win_size.height as i32 - 80;
            let _ = win.set_position(tauri::PhysicalPosition::new(x, y));
          }
        }
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/// Root cause of double-click-to-close on macOS:
/// With decorations:false, tao calls `setMovableByWindowBackground:YES` on every
/// NSWindow it creates, making the entire transparent surface act as a title bar.
/// Any double-click fires macOS's "title bar action" (zoom/close) at NSWindow level,
/// BEFORE WKWebView dispatches the event to JavaScript — so preventDefault/stopPropagation
/// in React and Tauri's on_window_event handler are both bypassed.
///
/// Fix: iterate NSApplication.windows synchronously in setup and reset the flag.
/// We go through NSApplication (not with_webview) because with_webview dispatches
/// async to the event loop, at which point the WKWebView may not yet be attached to
/// the NSWindow — causing [wkview window] to return nil and the fix to silently no-op.
#[cfg(target_os = "macos")]
fn disable_movable_by_window_background() {
    use objc2::runtime::{AnyClass, AnyObject};

    unsafe {
        let Some(app_class) = AnyClass::get("NSApplication") else {
            return;
        };
        // Class objects are AnyObject in the ObjC runtime — the cast is valid.
        let app_cls = (app_class as *const AnyClass)
            .cast::<AnyObject>()
            .cast_mut();

        let nsapp: *mut AnyObject = objc2::msg_send![app_cls, sharedApplication];
        if nsapp.is_null() {
            return;
        }

        let windows: *mut AnyObject = objc2::msg_send![nsapp, windows];
        if windows.is_null() {
            return;
        }

        let count: usize = objc2::msg_send![windows, count];
        for i in 0..count {
            let win: *mut AnyObject = objc2::msg_send![windows, objectAtIndex: i];
            if !win.is_null() {
                let _: () = objc2::msg_send![win, setMovableByWindowBackground: false];
            }
        }
    }
}
