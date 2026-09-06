import styles from './StatusMessage.module.css'

interface StatusMessageProps {
  children: string
  tone?: 'info' | 'error'
}

/** Inline notice for loading and failure states, in the same key as the rest of the page. */
export default function StatusMessage({ children, tone = 'info' }: StatusMessageProps) {
  return (
    <div
      className={tone === 'error' ? `${styles.status} ${styles.error}` : styles.status}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}
