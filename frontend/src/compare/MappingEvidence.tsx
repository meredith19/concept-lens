import type { MappingEvidence as Evidence } from '../domain/types.ts'
import styles from './MappingEvidence.module.css'

interface MappingEvidenceProps {
  evidence: Evidence
  onInspect: () => void
}

export default function MappingEvidence({ evidence, onInspect }: MappingEvidenceProps) {
  return (
    <>
      <div className={styles.proof}>
        <div>
          <div className={styles.proofTitle}>WHY DOES LENS SHOW THIS AS SHARED?</div>
          <div className={styles.path}>{evidence.path}</div>
          <div className={styles.meta}>{evidence.meta}</div>
        </div>
        <button onClick={onInspect}>Inspect mapping</button>
      </div>

      <div className={styles.note}>{evidence.note}</div>
    </>
  )
}
