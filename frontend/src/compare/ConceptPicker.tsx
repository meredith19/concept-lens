import type { Concept } from '../api/types.ts'
import styles from './ConceptPicker.module.css'

/**
 * Shortcuts to the comparisons worth seeing first. They are presentation, not domain data, so
 * they live here; any pair naming a concept the backend has not published is dropped.
 */
const SUGGESTED = [
  { left: 'returns.returnable', right: 'payments.refundable' },
  { left: 'fulfillment.shipped', right: 'delivery.delivered' },
  { left: 'orders.buyercountry', right: 'payments.billingcountry' },
]

function optionLabel(concept: Concept): string {
  return `${concept.name} · ${concept.sourceSystem}`
}

/** Omits the other side's current id: comparing a concept with itself is not a comparison. */
function optionsExcluding(concepts: Concept[], excludedId: string) {
  return concepts
    .filter((concept) => concept.id !== excludedId)
    .map((concept) => (
      <option key={concept.id} value={concept.id}>
        {optionLabel(concept)}
      </option>
    ))
}

interface ConceptPickerProps {
  concepts: Concept[]
  leftConceptId: string
  rightConceptId: string
  onChange: (leftConceptId: string, rightConceptId: string) => void
}

export default function ConceptPicker({
  concepts,
  leftConceptId,
  rightConceptId,
  onChange,
}: ConceptPickerProps) {
  const byId = new Map(concepts.map((concept) => [concept.id, concept]))

  // A suggestion matches the current pair in either direction: A↔B and B↔A are the same pair.
  const selected = new Set([leftConceptId, rightConceptId])
  const suggestions = SUGGESTED.flatMap((pair) => {
    const left = byId.get(pair.left)
    const right = byId.get(pair.right)
    if (!left || !right) {
      return []
    }
    const active = selected.has(pair.left) && selected.has(pair.right)
    return [{ ...pair, active, label: `${left.name} ↔ ${right.name}` }]
  })

  return (
    <section className="selector-card">
      <div className="selector-title">Compare concepts</div>
      <div className={styles.grid}>
        <div className={styles.selectWrap}>
          <label htmlFor="conceptA">CONCEPT A</label>
          <select
            id="conceptA"
            value={leftConceptId}
            onChange={(event) => onChange(event.target.value, rightConceptId)}
          >
            {optionsExcluding(concepts, rightConceptId)}
          </select>
        </div>

        <button
          className={styles.swap}
          onClick={() => onChange(rightConceptId, leftConceptId)}
          aria-label="Swap concepts"
        >
          ⇄
        </button>

        <div className={styles.selectWrap}>
          <label htmlFor="conceptB">CONCEPT B</label>
          <select
            id="conceptB"
            value={rightConceptId}
            onChange={(event) => onChange(leftConceptId, event.target.value)}
          >
            {optionsExcluding(concepts, leftConceptId)}
          </select>
        </div>
      </div>

      {suggestions.length > 0 && (
        <>
          <div className={styles.suggestedLabel}>SUGGESTED COMPARISONS</div>
          <div className={styles.suggested}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                className={suggestion.active ? styles.active : undefined}
                aria-pressed={suggestion.active}
                onClick={() => onChange(suggestion.left, suggestion.right)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
