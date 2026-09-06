import type { Takeaway as TakeawayContent } from './comparisonPresentation.ts'
import styles from './Takeaway.module.css'

interface TakeawayProps {
  takeaway: TakeawayContent
}

export default function Takeaway({ takeaway }: TakeawayProps) {
  return (
    <div className={styles.takeaway}>
      <div className={styles.label}>INTERPRETATION</div>
      <div className={styles.title}>{takeaway.title}</div>
      <div className={styles.copy}>{takeaway.copy}</div>
    </div>
  )
}
