import { useState } from 'react'

import type { Concept, MappingDraft } from '../api/types.ts'
import Drawer from '../components/Drawer.tsx'
import styles from './AddMappingDrawer.module.css'

interface AddMappingDrawerProps {
  open: boolean
  concepts: Concept[]
  onClose: () => void
  onSave: (draft: MappingDraft) => Promise<void>
}

function firstFactId(concept: Concept | undefined): string {
  return concept?.facts[0]?.id ?? ''
}

export default function AddMappingDrawer({
  open,
  concepts,
  onClose,
  onSave,
}: AddMappingDrawerProps) {
  const [sourceConceptId, setSourceConceptId] = useState(concepts[0]?.id ?? '')
  const [targetConceptId, setTargetConceptId] = useState(concepts[1]?.id ?? '')
  const [leftFactId, setLeftFactId] = useState(() => firstFactId(concepts[0]))
  const [rightFactId, setRightFactId] = useState(() => firstFactId(concepts[1]))
  const [rationale, setRationale] = useState('')
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<string>()

  const byId = new Map(concepts.map((concept) => [concept.id, concept]))
  const sourceFacts = byId.get(sourceConceptId)?.facts ?? []
  const targetFacts = byId.get(targetConceptId)?.facts ?? []

  const changeSource = (conceptId: string) => {
    setSourceConceptId(conceptId)
    setLeftFactId(firstFactId(byId.get(conceptId)))
  }

  const changeTarget = (conceptId: string) => {
    setTargetConceptId(conceptId)
    setRightFactId(firstFactId(byId.get(conceptId)))
  }

  const save = async () => {
    setSaving(true)
    setProblem(undefined)
    try {
      await onSave({
        leftFactId,
        rightFactId,
        type: 'SAME_MEANING',
        status: 'CONFIRMED',
        rationale,
        reviewedBy: 'Domain reviewer',
      })
    } catch (error) {
      setProblem(error instanceof Error ? error.message : 'Could not save the mapping')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="CREATE RELATIONSHIP"
      title="Add relationship"
      lead="Relate independently owned facts without modifying either source model."
    >
      <div className={styles.group}>
        <label htmlFor="sourceConcept">SOURCE CONCEPT</label>
        <select
          id="sourceConcept"
          value={sourceConceptId}
          onChange={(event) => changeSource(event.target.value)}
        >
          {concepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.name} · {concept.sourceSystem}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="sourceFact">SOURCE FACT</label>
        <select
          id="sourceFact"
          value={leftFactId}
          onChange={(event) => setLeftFactId(event.target.value)}
        >
          {sourceFacts.map((fact) => (
            <option key={fact.id} value={fact.id}>
              {fact.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="relationship">RELATIONSHIP</label>
        <select id="relationship" value="SAME_MEANING" disabled>
          <option value="SAME_MEANING">Same meaning</option>
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="targetConcept">TARGET CONCEPT</label>
        <select
          id="targetConcept"
          value={targetConceptId}
          onChange={(event) => changeTarget(event.target.value)}
        >
          {concepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.name} · {concept.sourceSystem}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="targetFact">TARGET FACT</label>
        <select
          id="targetFact"
          value={rightFactId}
          onChange={(event) => setRightFactId(event.target.value)}
        >
          {targetFacts.map((fact) => (
            <option key={fact.id} value={fact.id}>
              {fact.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor="evidence">EVIDENCE / NOTE</label>
        <textarea
          id="evidence"
          value={rationale}
          onChange={(event) => setRationale(event.target.value)}
          placeholder="Why do these facts state the same thing?"
        />
      </div>

      {problem && <div className={styles.problem}>{problem}</div>}

      <div className={styles.actions}>
        <button className="secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save mapping'}
        </button>
      </div>
    </Drawer>
  )
}
