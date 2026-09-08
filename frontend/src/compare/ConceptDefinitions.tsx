import type { Concept } from '../api/types.ts'
import styles from './ConceptDefinitions.module.css'

interface ConceptDefinitionsProps {
  conceptA: Concept
  conceptB: Concept
}

export default function ConceptDefinitions({ conceptA, conceptB }: ConceptDefinitionsProps) {
  return (
    <div className={styles.defs}>
      {[conceptA, conceptB].map((concept) => (
        <div key={concept.id} className={styles.def}>
          <div className={styles.owner}>{concept.sourceSystem.toUpperCase()}</div>
          <div className={styles.name}>{concept.name}</div>
          <div className={styles.meaning}>{concept.definition}</div>
        </div>
      ))}
    </div>
  )
}
