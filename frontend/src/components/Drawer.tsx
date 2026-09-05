import type { ReactNode } from 'react'

import styles from './Drawer.module.css'

interface DrawerProps {
  open: boolean
  onClose: () => void
  eyebrow: string
  title: string
  lead: string
  children: ReactNode
}

/** Right-hand slide-over with the shaded backdrop, as used by both mapping drawers. */
export default function Drawer({ open, onClose, eyebrow, title, lead, children }: DrawerProps) {
  if (!open) {
    return null
  }

  return (
    <>
      <div className={styles.shade} onClick={onClose} />
      <aside className={styles.drawer}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="eyebrow">{eyebrow}</div>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.lead}>{lead}</div>
        {children}
      </aside>
    </>
  )
}
