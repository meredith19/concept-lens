import type { Concept, Fact } from '../api/types.ts'
import { NO_MATCH, type ImplicationRow } from './comparisonPresentation.ts'
import styles from './ImplicationTable.module.css'

function FactCell({ fact }: { fact: Fact | null }) {
  if (!fact) {
    return <div>—</div>
  }

  return (
    <div>
      <span className={styles.factName}>{fact.label}</span>
      <span className={styles.factNative}>{fact.id}</span>
    </div>
  )
}

interface ImplicationTableProps {
  leftConcept: Concept
  rightConcept: Concept
  rows: ImplicationRow[]
}

export default function ImplicationTable({
  leftConcept,
  rightConcept,
  rows,
}: ImplicationTableProps) {
  return (
    <div className={styles.table}>
      <div className={`${styles.row} ${styles.header}`}>
        <div>{leftConcept.name} means…</div>
        <div className={styles.center}>Relationship</div>
        <div>{rightConcept.name} means…</div>
      </div>

      {rows.map((row, index) => (
        <div key={index} className={styles.row}>
          <FactCell fact={row.left} />
          <div className={styles.center}>
            <span
              className={
                row.relationship === NO_MATCH ? `${styles.pill} ${styles.unknown}` : styles.pill
              }
            >
              {row.relationship}
            </span>
          </div>
          <FactCell fact={row.right} />
        </div>
      ))}
    </div>
  )
}
