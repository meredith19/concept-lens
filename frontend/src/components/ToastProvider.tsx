import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import Toast from './Toast.tsx'
import { ToastContext } from './useToast.ts'

const VISIBLE_MS = 2600

interface ToastState {
  text: string
  /** Bumped on every call so re-showing the same text restarts the timer. */
  nonce: number
}

/**
 * One toast for the whole app. Nested pages call {@link useToast} instead of
 * mounting another fixed banner on top of this one.
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
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

  const api = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toast message={toast?.text ?? null} />
    </ToastContext.Provider>
  )
}
