import type { Concept } from '../domain/types.ts'
import styles from './ConceptDefinitions.module.css'

interface ConceptDefinitionsProps {
  conceptA: Concept
  conceptB: Concept
}

export default function ConceptDefinitions({ conceptA, conceptB }: ConceptDefinitionsProps) {
  return (
    <div className={styles.defs}>
      {[conceptA, conceptB].map((concept, index) => (
        <div key={index} className={styles.def}>
          <div className={styles.owner}>{concept.system.toUpperCase()}</div>
          <div className={styles.name}>{concept.name}</div>
          <div className={styles.meaning}>{concept.definition}</div>
        </div>
      ))}
    </div>
  )
}
