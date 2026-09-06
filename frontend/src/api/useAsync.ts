import { useCallback, useEffect, useState } from 'react'

import { ApiError } from './client.ts'

export interface AsyncState<T> {
  data: T | undefined
  error: string | undefined
  loading: boolean
  /** Re-runs the loader, for use after a change that invalidates the data. */
  reload: () => void
}

function describe(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  return error instanceof Error ? error.message : 'Something went wrong'
}

/**
 * Runs an async loader and tracks its outcome.
 *
 * The loader must be stable — wrap it in useCallback — so the effect re-runs only when the
 * request actually changes. Responses that arrive after the inputs changed are discarded, so
 * switching concepts quickly cannot leave an earlier comparison on screen.
 *
 * While a new request is in flight the previous result stays on screen rather than flashing a
 * placeholder, and state is only ever set from the resolved promise or from reload.
 */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({
    loading: true,
  })
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => {
    setState((current) => ({ ...current, loading: true }))
    setAttempt((current) => current + 1)
  }, [])

  useEffect(() => {
    let current = true

    load()
      .then((data) => {
        if (current) {
          setState({ data, loading: false })
        }
      })
      .catch((cause: unknown) => {
        if (current) {
          setState({ error: describe(cause), loading: false })
        }
      })

    return () => {
      current = false
    }
  }, [load, attempt])

  return { data: state.data, error: state.error, loading: state.loading, reload }
}
