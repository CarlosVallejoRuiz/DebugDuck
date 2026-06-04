import { useState, useRef, useCallback, useEffect } from 'react'
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification'
import { useStore } from '../store'

const POMODORO_SECONDS = 25 * 60

interface UsePomodoroReturn {
  isRunning: boolean
  secondsLeft: number
  startPomodoro: () => void
  cancelPomodoro: () => void
}

export function usePomodoro(onComplete?: () => void): UsePomodoroReturn {
  const [isRunning, setIsRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])
  const incrementPomodoros = useStore((s) => s.incrementPomodoros)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const fireNotification = useCallback(async () => {
    let granted = await isPermissionGranted()
    if (!granted) {
      const permission = await requestPermission()
      granted = permission === 'granted'
    }
    if (granted) {
      sendNotification({
        title: '¡Pomodoro completado! 🦆',
        body: 'Tómate un descanso de 5 minutos. Te lo ganaste.',
      })
    }
  }, [])

  const startPomodoro = useCallback(() => {
    clearTimer()
    setSecondsLeft(POMODORO_SECONDS)
    setIsRunning(true)

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          setIsRunning(false)
          incrementPomodoros()
          fireNotification()
          onCompleteRef.current?.()
          return POMODORO_SECONDS
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer, fireNotification, incrementPomodoros])

  const cancelPomodoro = useCallback(() => {
    clearTimer()
    setIsRunning(false)
    setSecondsLeft(POMODORO_SECONDS)
  }, [clearTimer])

  useEffect(() => () => clearTimer(), [clearTimer])

  return { isRunning, secondsLeft, startPomodoro, cancelPomodoro }
}
