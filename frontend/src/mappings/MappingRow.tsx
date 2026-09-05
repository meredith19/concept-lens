import type { Mapping } from '../domain/types.ts'
import styles from './MappingRow.module.css'

interface MappingRowProps {
  mapping: Mapping
  onView: () => void
  onRemove: () => void
}

export default function MappingRow({ mapping, onView, onRemove }: MappingRowProps) {
  return (
    <div className={styles.row}>
      <div>
        <div className={styles.nodes}>
          {mapping.source}
          <br />
          {mapping.connector}
          <br />
          {mapping.target}
        </div>
        <div className={styles.relation}>{mapping.relation}</div>
        <div className="tags">
          {mapping.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
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
