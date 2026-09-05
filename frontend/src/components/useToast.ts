import { useCallback, useEffect, useRef, useState } from 'react'

const VISIBLE_MS = 2600

interface ToastState {
  text: string
  /** Bumped on every call so re-showing the same text restarts the timer. */
  nonce: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const nonce = useRef(0)

  const showToast = useCallback((text: string) => {
    nonce.current += 1
    setToast({ text, nonce: nonce.current })
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }
    const timer = setTimeout(() => setToast(null), VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [toast])

  return { message: toast?.text ?? null, showToast }
}
