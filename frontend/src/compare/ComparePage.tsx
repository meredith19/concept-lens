import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { api } from '../api/client.ts'
import type { FactMatch } from '../api/types.ts'
import { useAsync } from '../api/useAsync.ts'
import Hero from '../components/Hero.tsx'
import StatusMessage from '../components/StatusMessage.tsx'
import { useToast } from '../components/useToast.ts'
import MappingDetailDrawer, { REMOVE_MAPPING_PROMPT } from '../mappings/MappingDetailDrawer.tsx'
import ConceptDefinitions from './ConceptDefinitions.tsx'
import ConceptPicker from './ConceptPicker.tsx'
import ImplicationTable from './ImplicationTable.tsx'
import RelatedComparisons from './RelatedComparisons.tsx'
import RelationshipVenn from './RelationshipVenn.tsx'
import Takeaway from './Takeaway.tsx'
import { headline, implicationRows, takeaway } from './comparisonPresentation.ts'
import { relatedPairs } from './relatedComparisons.ts'
import styles from './ComparePage.module.css'

const HERO = {
  title: 'Understand how concepts across systems relate.',
  lead: 'Compare independently owned concepts using confirmed semantic mappings.',
}

export default function ComparePage() {
  const [pair, setPair] = useState<{ left: string; right: string }>()
  const [inspected, setInspected] = useState<FactMatch>()
  const evidenceRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const loadConcepts = useCallback(() => api.concepts(), [])
  const concepts = useAsync(loadConcepts)

  // Until a concept is picked, compare the first two published, which is what the page opens on.
  const available = concepts.data ?? []
  const systemCount = new Set(available.map((concept) => concept.sourceSystem)).size
  const catalog = available.length
    ? `Demo catalog · ${available.length} concepts across ${systemCount} systems`
    : undefined
  const left = pair?.left ?? available[0]?.id
  const right = pair?.right ?? available[1]?.id

  const loadComparison = useCallback(
    () => (left && right ? api.compare(left, right) : Promise.resolve(undefined)),
    [left, right],
  )
  const comparison = useAsync(loadComparison)

  const loadMappings = useCallback(() => api.mappings(), [])
  const mappings = useAsync(loadMappings)

  const removeMapping = async (match: FactMatch) => {
    if (!window.confirm(REMOVE_MAPPING_PROMPT)) {
      return
    }
    try {
      await api.deleteMapping(match.mapping.id)
      setInspected(undefined)
      comparison.reload()
      mappings.reload()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not remove the mapping')
    }
  }

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
      <Hero {...HERO} meta={catalog} />

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

          <div className={styles.derivation}>
            <button
              className={styles.derivedFrom}
              onClick={() =>
                evidenceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              Derived from {result.matchedFacts.length} confirmed{' '}
              {result.matchedFacts.length === 1 ? 'mapping' : 'mappings'} ↓
            </button>
            <span className={styles.unknownNote}>Unmapped means unknown, not different.</span>
          </div>

          <div className="section-title">How are these concepts related?</div>
          <div className="section-sub">{headline(result).summary}</div>

          <RelationshipVenn result={result} />

          <div className={styles.evidenceHeader} ref={evidenceRef}>
            <div>
              <div className="section-title">How they relate</div>
              <div className="section-sub">
                See what’s confirmed as shared and what has no confirmed match.
              </div>
            </div>
            <button className={styles.manageLink} onClick={() => navigate('/mappings')}>
              Manage mappings →
            </button>
          </div>

          <ImplicationTable
            leftConcept={result.leftConcept}
            rightConcept={result.rightConcept}
            rows={implicationRows(result)}
            onInspect={setInspected}
          />

          {mappings.data && (
            <RelatedComparisons
              pairs={relatedPairs(available, mappings.data, left, right)}
              onSelect={(nextLeft, nextRight) => setPair({ left: nextLeft, right: nextRight })}
            />
          )}

          {inspected && (
            <MappingDetailDrawer
              open
              onClose={() => setInspected(undefined)}
              match={inspected}
              leftConcept={result.leftConcept}
              rightConcept={result.rightConcept}
              onRemove={() => void removeMapping(inspected)}
            />
          )}
        </section>
      )}
    </main>
  )
}
