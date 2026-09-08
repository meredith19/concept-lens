import { mappingStatusLabel, mappingTypeLabel } from '../api/labels.ts'
import Drawer from '../components/Drawer.tsx'
import type { Concept, FactMatch } from '../api/types.ts'
import styles from './MappingDetailDrawer.module.css'

interface MappingDetailDrawerProps {
  open: boolean
  onClose: () => void
  match: FactMatch
  leftConcept: Concept
  rightConcept: Concept
  /** Optional: removing the mapping this drawer is showing. */
  onRemove?: () => void
}

/** Shared by Compare and Mappings: removing a mapping changes the next comparison. */
export const REMOVE_MAPPING_PROMPT =
  'Remove this mapping? Comparisons will no longer use it.'

/**
 * Shows the two facts a mapping relates, and the provenance Concept Lens holds for the claim.
 *
 * <p>The facts lead. Their ids are kept as quiet metadata rather than headline text, and the
 * rationale sits below them so it explains the mapping instead of introducing it.
 */
export default function MappingDetailDrawer({
  open,
  onClose,
  match,
  leftConcept,
  rightConcept,
  onRemove,
}: MappingDetailDrawerProps) {
  const sides = [
    { concept: leftConcept, fact: match.leftFact },
    { concept: rightConcept, fact: match.rightFact },
  ]

  const details = [
    { label: 'RELATIONSHIP', value: mappingTypeLabel(match.mapping.type) },
    {
      label: 'STATUS',
      value: mappingStatusLabel(match.mapping.status),
    },
    { label: 'REVIEWED BY', value: match.mapping.reviewedBy },
    { label: 'RELATION ID', value: match.mapping.id },
  ]

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="MAPPING EVIDENCE"
      title="Confirmed mapping"
      lead="These two facts are confirmed as stating the same thing."
    >
      {sides.map((side, index) => (
        <div key={side.fact.id}>
          {index > 0 && <div className={styles.equals}>≡</div>}
          <div className={styles.factCard}>
            <div className={styles.owner}>
              {side.concept.sourceSystem.toUpperCase()} · {side.concept.name.toUpperCase()}
            </div>
            <div className={styles.label}>{side.fact.label}</div>
            <div className={styles.description}>{side.fact.description}</div>
            <div className={styles.factId}>{side.fact.id}</div>
          </div>
        </div>
      ))}

      <div className={styles.rationale}>
        <small>RATIONALE</small>
        <div>{match.mapping.rationale || 'No rationale recorded.'}</div>
      </div>

      <div className={styles.details}>
        {details.map((detail) => (
          <div key={detail.label}>
            <small>{detail.label}</small>
            <b>{detail.value}</b>
          </div>
        ))}
      </div>

      {onRemove && (
        <div className={styles.actions}>
          <button className={styles.remove} onClick={onRemove}>
            Remove mapping
          </button>
        </div>
      )}
    </Drawer>
  )
}
