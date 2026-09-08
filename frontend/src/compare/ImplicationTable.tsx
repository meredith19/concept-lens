import type { Concept, Fact } from '../api/types.ts'
import { NO_MATCH, type ImplicationRow } from './comparisonPresentation.ts'
import styles from './ImplicationTable.module.css'

function FactCell({ fact }: { fact: Fact | null }) {
  if (!fact) {
    return <div>—</div>
  }

  return <div className={styles.factName}>{fact.label}</div>
}

interface ImplicationTableProps {
  leftConcept: Concept
  rightConcept: Concept
  rows: ImplicationRow[]
  onInspect: (match: NonNullable<ImplicationRow['match']>) => void
}

export default function ImplicationTable({
  leftConcept,
  rightConcept,
  rows,
  onInspect,
}: ImplicationTableProps) {
  return (
    <div className={styles.table}>
      <div className={`${styles.row} ${styles.header}`}>
        <div>{leftConcept.name} means…</div>
        <div className={styles.center}>Relationship</div>
        <div>{rightConcept.name} means…</div>
      </div>

      {rows.map((row) => {
        const match = row.match
        return (
          <div
            key={match?.mapping.id ?? row.left?.id ?? row.right?.id}
            className={styles.row}
          >
            <FactCell fact={row.left} />
            <div className={styles.center}>
              <span
                className={
                  row.relationship === NO_MATCH ? `${styles.pill} ${styles.unknown}` : styles.pill
                }
              >
                {row.relationship}
              </span>
              {match && (
                <div className={styles.rowMeta}>
                  Confirmed ·{' '}
                  <button
                    className={styles.inspect}
                    onClick={() => onInspect(match)}
                    aria-label={`Inspect mapping ${match.mapping.id}`}
                  >
                    Inspect
                  </button>
                </div>
              )}
            </div>
            <FactCell fact={row.right} />
          </div>
        )
      })}
    </div>
  )
}
