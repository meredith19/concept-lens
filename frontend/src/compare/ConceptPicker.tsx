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
  const options = concepts.map((concept) => (
    <option key={concept.id} value={concept.id}>
      {optionLabel(concept)}
    </option>
  ))

  const suggestions = SUGGESTED.flatMap((pair) => {
    const left = byId.get(pair.left)
    const right = byId.get(pair.right)
    return left && right ? [{ ...pair, label: `${left.name} ↔ ${right.name}` }] : []
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
            {options}
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
            {options}
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
