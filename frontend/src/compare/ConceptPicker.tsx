import { CONCEPT_LIST, SUGGESTED_COMPARISONS, conceptOptionLabel } from '../domain/concepts.ts'
import styles from './ConceptPicker.module.css'

interface ConceptPickerProps {
  conceptAId: string
  conceptBId: string
  onChange: (aId: string, bId: string) => void
}

export default function ConceptPicker({ conceptAId, conceptBId, onChange }: ConceptPickerProps) {
  const options = CONCEPT_LIST.map((concept) => (
    <option key={concept.id} value={concept.id}>
      {conceptOptionLabel(concept)}
    </option>
  ))

  return (
    <section className="selector-card">
      <div className="selector-title">Compare concepts</div>
      <div className={styles.grid}>
        <div className={styles.selectWrap}>
          <label htmlFor="conceptA">CONCEPT A</label>
          <select
            id="conceptA"
            value={conceptAId}
            onChange={(event) => onChange(event.target.value, conceptBId)}
          >
            {options}
          </select>
        </div>

        <button className={styles.swap} onClick={() => onChange(conceptBId, conceptAId)}>
          ⇄
        </button>

        <div className={styles.selectWrap}>
          <label htmlFor="conceptB">CONCEPT B</label>
          <select
            id="conceptB"
            value={conceptBId}
            onChange={(event) => onChange(conceptAId, event.target.value)}
          >
            {options}
          </select>
        </div>
      </div>

      <div className={styles.suggestedLabel}>SUGGESTED COMPARISONS</div>
      <div className={styles.suggested}>
        {SUGGESTED_COMPARISONS.map((suggestion) => (
          <button
            key={suggestion.label}
            onClick={() => onChange(suggestion.a, suggestion.b)}
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </section>
  )
}
