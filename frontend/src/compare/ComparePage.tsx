import { useState } from 'react'

import Hero from '../components/Hero.tsx'
import { CONCEPTS, DEFAULT_PAIR } from '../domain/concepts.ts'
import {
  implicationRows,
  mappingEvidence,
  takeaway as takeawayFor,
} from '../domain/comparisonNarrative.ts'
import { classify, summarize } from '../domain/relationship.ts'
import MappingDetailDrawer from '../mappings/MappingDetailDrawer.tsx'
import ConceptDefinitions from './ConceptDefinitions.tsx'
import ConceptPicker from './ConceptPicker.tsx'
import ImplicationTable from './ImplicationTable.tsx'
import MappingEvidence from './MappingEvidence.tsx'
import RelationshipVenn from './RelationshipVenn.tsx'
import Takeaway from './Takeaway.tsx'
import styles from './ComparePage.module.css'

export default function ComparePage() {
  const [pair, setPair] = useState<{ a: string; b: string }>({ ...DEFAULT_PAIR })
  const [detailOpen, setDetailOpen] = useState(false)

  const conceptA = CONCEPTS[pair.a]
  const conceptB = CONCEPTS[pair.b]

  const comparison = classify(conceptA, conceptB)
  const { badge, summary } = summarize(comparison.relationship, conceptA, conceptB)

  return (
    <main>
      <Hero
        eyebrow="EXPLORE MEANING ACROSS SYSTEMS"
        title="Compare any two concepts."
        lead="Choose concepts defined by different systems and see what they mean, what they imply, and where they differ."
      />

      <ConceptPicker
        conceptAId={pair.a}
        conceptBId={pair.b}
        onChange={(a, b) => setPair({ a, b })}
      />

      <section className="card">
        <div className={styles.top}>
          <div>
            <div className="eyebrow">CONCEPT COMPARISON</div>
            <div className={styles.title}>
              {conceptA.name} vs {conceptB.name}
            </div>
          </div>
          <div className={styles.badge}>{badge}</div>
        </div>

        <ConceptDefinitions conceptA={conceptA} conceptB={conceptB} />

        <Takeaway takeaway={takeawayFor(conceptA.id, conceptB.id)} />

        <div className="section-title">How are these concepts related?</div>
        <div className="section-sub">{summary}</div>

        <RelationshipVenn comparison={comparison} conceptA={conceptA} conceptB={conceptB} />

        <div className="section-title">How does the right concept relate to the left?</div>
        <div className="section-sub">
          Use the left concept as the anchor. See which of its meanings match something in the
          right concept, and what the right concept adds.
        </div>

        <ImplicationTable
          conceptA={conceptA}
          conceptB={conceptB}
          rows={implicationRows(conceptA.id, conceptB.id)}
        />

        <MappingEvidence
          evidence={mappingEvidence(conceptA.id, conceptB.id)}
          onInspect={() => setDetailOpen(true)}
        />
      </section>

      <MappingDetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} />
    </main>
  )
}
