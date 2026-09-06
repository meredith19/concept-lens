import type { Fact, SemanticMapping } from '../api/types.ts'
import styles from './MappingRow.module.css'

interface MappingRowProps {
  mapping: SemanticMapping
  /** Resolved facts, when the owning concepts are known, so the row can show labels. */
  leftFact: Fact | undefined
  rightFact: Fact | undefined
  onView: () => void
  onRemove: () => void
}

export default function MappingRow({
  mapping,
  leftFact,
  rightFact,
  onView,
  onRemove,
}: MappingRowProps) {
  return (
    <div className={styles.row}>
      <div>
        <div className={styles.nodes}>
          {mapping.leftFactId}
          <br />↕<br />
          {mapping.rightFactId}
        </div>
        <div className={styles.relation}>{mapping.type.replace('_', ' ')}</div>
        {leftFact && rightFact && (
          <div className={styles.labels}>
            {leftFact.label} ↔ {rightFact.label}
          </div>
        )}
        <div className="tags">
          <span className="tag">{mapping.status === 'CONFIRMED' ? 'Confirmed' : mapping.status}</span>
          <span className="tag">{mapping.reviewedBy}</span>
          <span className="tag">{mapping.id}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={onView}>View</button>
        <button type="button" onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  )
}
