import picker from './ConceptPicker.module.css'
import styles from './RelatedComparisons.module.css'
import type { RelatedPair } from './relatedComparisons.ts'

interface RelatedComparisonsProps {
  pairs: RelatedPair[]
  onSelect: (leftConceptId: string, rightConceptId: string) => void
}

/**
 * The section always renders. Having no related comparisons is a fact about the confirmed
 * mappings, so it is stated rather than hidden.
 */
export default function RelatedComparisons({ pairs, onSelect }: RelatedComparisonsProps) {
  return (
    <>
      <div className="section-title">Related concepts</div>
      <div className="section-sub">
        Other comparisons connected by confirmed semantic mappings.
      </div>
      {pairs.length === 0 ? (
        <div className={styles.empty}>No other related comparisons in this demo data.</div>
      ) : (
        <div className={picker.suggested}>
          {pairs.map((pair) => (
            <button
              key={`${pair.left}|${pair.right}`}
              onClick={() => onSelect(pair.left, pair.right)}
            >
              {pair.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
