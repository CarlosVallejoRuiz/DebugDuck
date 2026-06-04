import { useCallback } from 'react'
import { getCurrentWindow, currentMonitor, LogicalPosition } from '@tauri-apps/api/window'
import { useStore } from '../store'

export type Position =
  | 'top-left' | 'top' | 'top-right'
  | 'left'     | 'center' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'

const WIN_W      = 280   // must match tauri.conf.json → app.windows[0].width
const WIN_H      = 550   // must match tauri.conf.json → app.windows[0].height
const MARGIN     = 16    // edge gap
const DOCK_MARGIN = 80   // extra bottom gap for macOS Dock / Windows taskbar

export function useWindowPosition() {
  const setIsTopPosition = useStore((s) => s.setIsTopPosition)

  const moveToPosition = useCallback(async (pos: Position) => {
    const monitor = await currentMonitor()
    if (!monitor) return

    const scale = monitor.scaleFactor
    const logW  = monitor.size.width  / scale   // physical → logical
    const logH  = monitor.size.height / scale

    let x: number
    let y: number

    switch (pos) {
      case 'top-left':     x = MARGIN;                  y = MARGIN;                       break
      case 'top':          x = (logW - WIN_W) / 2;     y = MARGIN;                       break
      case 'top-right':    x = logW - WIN_W - MARGIN;  y = MARGIN;                       break
      case 'left':         x = MARGIN;                  y = (logH - WIN_H) / 2;          break
      case 'center':       x = (logW - WIN_W) / 2;     y = (logH - WIN_H) / 2;          break
      case 'right':        x = logW - WIN_W - MARGIN;  y = (logH - WIN_H) / 2;          break
      case 'bottom-left':  x = MARGIN;                  y = logH - WIN_H - DOCK_MARGIN;  break
      case 'bottom':       x = (logW - WIN_W) / 2;     y = logH - WIN_H - DOCK_MARGIN;  break
      case 'bottom-right': x = logW - WIN_W - MARGIN;  y = logH - WIN_H - DOCK_MARGIN;  break
    }

    await getCurrentWindow().setPosition(new LogicalPosition(x, y))
    setIsTopPosition(pos.startsWith('top'))
  }, [setIsTopPosition])

  return { moveToPosition }
}
