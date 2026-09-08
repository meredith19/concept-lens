import { useCallback, useState } from 'react'

import { api } from '../api/client.ts'
import type { Concept, Fact, MappingDraft, SemanticMapping } from '../api/types.ts'
import { useAsync } from '../api/useAsync.ts'
import Hero from '../components/Hero.tsx'
import StatusMessage from '../components/StatusMessage.tsx'
import { useToast } from '../components/useToast.ts'
import AddMappingDrawer from './AddMappingDrawer.tsx'
import MappingDetailDrawer, { REMOVE_MAPPING_PROMPT } from './MappingDetailDrawer.tsx'
import MappingRow from './MappingRow.tsx'
import styles from './MappingsPage.module.css'

interface Located {
  concept: Concept
  fact: Fact
}

/** Index of every published fact by id, so a mapping can be shown with labels and owners. */
function indexFacts(concepts: Concept[]): Map<string, Located> {
  const index = new Map<string, Located>()
  for (const concept of concepts) {
    for (const fact of concept.facts) {
      index.set(fact.id, { concept, fact })
    }
  }
  return index
}

function haystack(mapping: SemanticMapping, facts: Map<string, Located>): string {
  const label = (factId: string) => facts.get(factId)?.fact.label ?? ''
  return [
    mapping.id,
    mapping.leftFactId,
    mapping.rightFactId,
    mapping.type,
    mapping.status,
    mapping.reviewedBy,
    mapping.rationale,
    label(mapping.leftFactId),
    label(mapping.rightFactId),
  ]
    .join(' ')
    .toLowerCase()
}

export default function MappingsPage() {
  const loadMappings = useCallback(() => api.mappings(), [])
  const loadConcepts = useCallback(() => api.concepts(), [])
  const mappings = useAsync(loadMappings)
  const concepts = useAsync(loadConcepts)

  const [filter, setFilter] = useState('')
  const [inspected, setInspected] = useState<SemanticMapping>()
  const [adding, setAdding] = useState(false)
  const { showToast } = useToast()

  const facts = indexFacts(concepts.data ?? [])
  const query = filter.trim().toLowerCase()
  const visible = (mappings.data ?? []).filter(
    (mapping) => !query || haystack(mapping, facts).includes(query),
  )

  const remove = async (mapping: SemanticMapping) => {
    if (!window.confirm(REMOVE_MAPPING_PROMPT)) {
      return
    }
    try {
      await api.deleteMapping(mapping.id)
      mappings.reload()
      showToast('Mapping removed')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not remove the mapping')
    }
  }

  const add = async (draft: MappingDraft) => {
    const created = await api.createMapping(draft)
    setAdding(false)
    mappings.reload()
    showToast(`Mapping ${created.id} saved as Confirmed · ${created.reviewedBy}`)
  }

  const inspectedMatch = inspected && {
    leftFact: facts.get(inspected.leftFactId)?.fact,
    rightFact: facts.get(inspected.rightFactId)?.fact,
    leftConcept: facts.get(inspected.leftFactId)?.concept,
    rightConcept: facts.get(inspected.rightFactId)?.concept,
  }

  return (
    <main>
      <Hero
        eyebrow="RELATIONSHIPS ACROSS SYSTEMS"
        title="Mappings"
        lead="Keep concepts independently owned. Make their relationships explicit without forcing source systems into one canonical vocabulary."
      />

      <section className="selector-card">
        <div className="selector-title">Mappings</div>
        <div className={styles.toolbar}>
          <input
            placeholder="Filter mappings…"
            aria-label="Filter mappings"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <button className="primary" onClick={() => setAdding(true)}>
            + Add mapping
          </button>
        </div>

        {mappings.error && (
          <StatusMessage tone="error">{`Could not load mappings. ${mappings.error}`}</StatusMessage>
        )}
        {!mappings.data && !mappings.error && <StatusMessage>Loading mappings…</StatusMessage>}

        <div className={styles.list}>
          {visible.map((mapping) => (
            <MappingRow
              key={mapping.id}
              mapping={mapping}
              leftFact={facts.get(mapping.leftFactId)?.fact}
              rightFact={facts.get(mapping.rightFactId)?.fact}
              onView={() => setInspected(mapping)}
              onRemove={() => void remove(mapping)}
            />
          ))}
        </div>
      </section>

      {inspected &&
        inspectedMatch?.leftFact &&
        inspectedMatch.rightFact &&
        inspectedMatch.leftConcept &&
        inspectedMatch.rightConcept && (
          <MappingDetailDrawer
            open
            onClose={() => setInspected(undefined)}
            match={{
              leftFact: inspectedMatch.leftFact,
              rightFact: inspectedMatch.rightFact,
              mapping: inspected,
            }}
            leftConcept={inspectedMatch.leftConcept}
            rightConcept={inspectedMatch.rightConcept}
            onRemove={() => {
              const target = inspected
              setInspected(undefined)
              void remove(target)
            }}
          />
        )}

      {adding && concepts.data && (
        <AddMappingDrawer
          open
          concepts={concepts.data}
          onClose={() => setAdding(false)}
          onSave={add}
        />
      )}
    </main>
  )
}
