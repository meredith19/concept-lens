import Drawer from '../components/Drawer.tsx'
import type { Concept, FactMatch } from '../api/types.ts'
import styles from './MappingDetailDrawer.module.css'

interface MappingDetailDrawerProps {
  open: boolean
  onClose: () => void
  match: FactMatch
  leftConcept: Concept
  rightConcept: Concept
}

/** Shows the two related facts and the provenance Concept Lens holds for the claim. */
export default function MappingDetailDrawer({
  open,
  onClose,
  match,
  leftConcept,
  rightConcept,
}: MappingDetailDrawerProps) {
  const sides = [
    { concept: leftConcept, fact: match.leftFact },
    { concept: rightConcept, fact: match.rightFact },
  ]

  const details = [
    { label: 'RELATIONSHIP', value: 'Same meaning' },
    { label: 'STATUS', value: match.mapping.status === 'CONFIRMED' ? 'Confirmed' : match.mapping.status },
    { label: 'REVIEWED BY', value: match.mapping.reviewedBy },
    { label: 'RELATION ID', value: match.mapping.id },
  ]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="TRACE THE REASONING"
      title="Why is this shared?"
      lead="The source systems keep their own concepts and vocabulary. Concept Lens stores a separate, provenance-bearing relationship between their facts."
    >
      {sides.map((side, index) => (
        <div key={side.fact.id}>
          {index > 0 && <div className={styles.equals}>≡</div>}
          <div className={styles.factCard}>
            <div className={styles.owner}>
              {side.concept.sourceSystem.toUpperCase()} · {side.concept.name.toUpperCase()}
            </div>
            <div className={styles.native}>{side.fact.id}</div>
            <div className={styles.description}>{side.fact.description}</div>
          </div>
        </div>
      ))}

      {match.mapping.rationale && (
        <div className={styles.description} style={{ marginTop: 14 }}>
          {match.mapping.rationale}
        </div>
      )}

      <div className={styles.details}>
        {details.map((detail) => (
          <div key={detail.label}>
            <small>{detail.label}</small>
            <b>{detail.value}</b>
          </div>
        ))}
      </div>
    </Drawer>
  )
}
