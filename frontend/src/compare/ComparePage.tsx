import { useCallback, useState } from 'react'

import { api } from '../api/client.ts'
import { useAsync } from '../api/useAsync.ts'
import Hero from '../components/Hero.tsx'
import StatusMessage from '../components/StatusMessage.tsx'
import MappingDetailDrawer from '../mappings/MappingDetailDrawer.tsx'
import ConceptDefinitions from './ConceptDefinitions.tsx'
import ConceptPicker from './ConceptPicker.tsx'
import ImplicationTable from './ImplicationTable.tsx'
import MappingEvidence from './MappingEvidence.tsx'
import RelationshipVenn from './RelationshipVenn.tsx'
import Takeaway from './Takeaway.tsx'
import { evidence, headline, implicationRows, takeaway } from './comparisonPresentation.ts'
import styles from './ComparePage.module.css'

const HERO = {
  eyebrow: 'EXPLORE MEANING ACROSS SYSTEMS',
  title: 'Compare any two concepts.',
  lead: 'Choose concepts defined by different systems and see what they mean, what they imply, and where they differ.',
}

export default function ComparePage() {
  const [pair, setPair] = useState<{ left: string; right: string }>()
  const [inspecting, setInspecting] = useState(false)

  const loadConcepts = useCallback(() => api.concepts(), [])
  const concepts = useAsync(loadConcepts)

  // Until a concept is picked, compare the first two published, which is what the page opens on.
  const available = concepts.data ?? []
  const left = pair?.left ?? available[0]?.id
  const right = pair?.right ?? available[1]?.id

  const loadComparison = useCallback(
    () => (left && right ? api.compare(left, right) : Promise.resolve(undefined)),
    [left, right],
  )
  const comparison = useAsync(loadComparison)

  if (concepts.error) {
    return (
      <main>
        <Hero {...HERO} />
        <StatusMessage tone="error">{`Could not load concepts. ${concepts.error}`}</StatusMessage>
      </main>
    )
  }

  const result = comparison.data

  return (
    <main>
      <Hero {...HERO} />

      {available.length > 0 && left && right && (
        <ConceptPicker
          concepts={available}
          leftConceptId={left}
          rightConceptId={right}
          onChange={(nextLeft, nextRight) => setPair({ left: nextLeft, right: nextRight })}
        />
      )}

      {comparison.error && (
        <StatusMessage tone="error">{`Could not compare these concepts. ${comparison.error}`}</StatusMessage>
      )}

      {!result && !comparison.error && <StatusMessage>Loading comparison…</StatusMessage>}

      {result && (
        <section className="card">
          <div className={styles.top}>
            <div>
              <div className="eyebrow">CONCEPT COMPARISON</div>
              <div className={styles.title}>
                {result.leftConcept.name} vs {result.rightConcept.name}
              </div>
            </div>
            <div className={styles.badge}>{headline(result).badge}</div>
          </div>

          <ConceptDefinitions conceptA={result.leftConcept} conceptB={result.rightConcept} />

          <Takeaway takeaway={takeaway(result)} />

          <div className="section-title">How are these concepts related?</div>
          <div className="section-sub">{headline(result).summary}</div>

          <RelationshipVenn result={result} />

          <div className="section-title">How does the right concept relate to the left?</div>
          <div className="section-sub">
            Use the left concept as the anchor. See which of its meanings match something in the
            right concept, and what the right concept adds.
          </div>

          <ImplicationTable
            leftConcept={result.leftConcept}
            rightConcept={result.rightConcept}
            rows={implicationRows(result)}
          />

          <MappingEvidence evidence={evidence(result)} onInspect={() => setInspecting(true)} />

          {result.matchedFacts[0] && (
            <MappingDetailDrawer
              open={inspecting}
              onClose={() => setInspecting(false)}
              match={result.matchedFacts[0]}
              leftConcept={result.leftConcept}
              rightConcept={result.rightConcept}
            />
          )}
        </section>
      )}
    </main>
  )
}
