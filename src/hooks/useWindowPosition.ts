import { useCallback } from 'react'
import { getCurrentWindow, currentMonitor, LogicalPosition } from '@tauri-apps/api/window'

export type Position =
  | 'top-left' | 'top' | 'top-right'
  | 'left'     | 'center' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right'

const MARGIN = 60
const WIN_W = 400
const WIN_H = 500

export function useWindowPosition() {
  const moveToPosition = useCallback(async (pos: Position) => {
    const monitor = await currentMonitor()
    if (!monitor) return

    const scale = monitor.scaleFactor
    // Physical → logical pixels
    const logW = monitor.size.width / scale
    const logH = monitor.size.height / scale

    let x: number
    let y: number

    switch (pos) {
      case 'top-left':     x = MARGIN;                  y = MARGIN;                  break
      case 'top':          x = (logW - WIN_W) / 2;     y = MARGIN;                  break
      case 'top-right':    x = logW - WIN_W - MARGIN;  y = MARGIN;                  break
      case 'left':         x = MARGIN;                  y = (logH - WIN_H) / 2;     break
      case 'center':       x = (logW - WIN_W) / 2;     y = (logH - WIN_H) / 2;     break
      case 'right':        x = logW - WIN_W - MARGIN;  y = (logH - WIN_H) / 2;     break
      case 'bottom-left':  x = MARGIN;                  y = logH - WIN_H - MARGIN;  break
      case 'bottom':       x = (logW - WIN_W) / 2;     y = logH - WIN_H - MARGIN;  break
      case 'bottom-right': x = logW - WIN_W - MARGIN;  y = logH - WIN_H - MARGIN;  break
    }

    await getCurrentWindow().setPosition(new LogicalPosition(x, y))
  }, [])

  return { moveToPosition }
}
