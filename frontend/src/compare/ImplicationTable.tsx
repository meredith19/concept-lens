import { NO_MATCH } from '../domain/comparisonNarrative.ts'
import type { Concept, Fact, ImplicationRow } from '../domain/types.ts'
import styles from './ImplicationTable.module.css'

function FactCell({ fact }: { fact: Fact | null }) {
  if (!fact) {
    return <div>—</div>
  }

  return (
    <div>
      <span className={styles.factName}>{fact.name}</span>
      {fact.native && <span className={styles.factNative}>{fact.native}</span>}
    </div>
  )
}

interface ImplicationTableProps {
  conceptA: Concept
  conceptB: Concept
  rows: ImplicationRow[]
}

export default function ImplicationTable({ conceptA, conceptB, rows }: ImplicationTableProps) {
  return (
    <div className={styles.table}>
      <div className={`${styles.row} ${styles.header}`}>
        <div>{conceptA.name} means…</div>
        <div className={styles.center}>Relationship</div>
        <div>{conceptB.name} means…</div>
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
