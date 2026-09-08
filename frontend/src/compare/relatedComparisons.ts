import type { Concept, SemanticMapping } from '../api/types.ts'

export interface RelatedPair {
  left: string
  right: string
  label: string
}

function conceptIdByFactId(concepts: Concept[]): Map<string, string> {
  const index = new Map<string, string>()
  for (const concept of concepts) {
    for (const fact of concept.facts) {
      index.set(fact.id, concept.id)
    }
  }
  return index
}

/**
 * Other comparisons worth opening from the pair on screen.
 *
 * A confirmed SAME_MEANING mapping relates the concepts that own its two facts —
 * the same edge SemanticGraph draws on the backend, kept in step here so both
 * sides agree on what counts as a connection. This lists undirected pairs that
 * share a vertex with the current pair, excluding the pair itself.
 *
 * Only direct neighbors are included — a mapping from A to B and B to C
 * does not recommend A↔C. The comparison API only returns mappings between the
 * two selected concepts, so this is computed from the full mapping list instead.
 */
export function relatedPairs(
  concepts: Concept[],
  mappings: SemanticMapping[],
  leftConceptId: string,
  rightConceptId: string,
): RelatedPair[] {
  const owner = conceptIdByFactId(concepts)
  const byId = new Map(concepts.map((concept) => [concept.id, concept]))

  const neighbors = new Map<string, Set<string>>()
  const addEdge = (from: string, to: string) => {
    const existing = neighbors.get(from) ?? new Set<string>()
    existing.add(to)
    neighbors.set(from, existing)
  }

  for (const mapping of mappings) {
    if (mapping.type !== 'SAME_MEANING' || mapping.status !== 'CONFIRMED') {
      continue
    }
    const left = owner.get(mapping.leftFactId)
    const right = owner.get(mapping.rightFactId)
    if (!left || !right || left === right) {
      continue
    }
    addEdge(left, right)
    addEdge(right, left)
  }

  const seen = new Set<string>()
  const pairs: RelatedPair[] = []
  const current = new Set([leftConceptId, rightConceptId])

  const addFrom = (anchor: string) => {
    for (const other of neighbors.get(anchor) ?? []) {
      if (current.has(other)) {
        continue
      }
      const key = [anchor, other].sort().join('|')
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      const leftConcept = byId.get(anchor)
      const rightConcept = byId.get(other)
      if (!leftConcept || !rightConcept) {
        continue
      }
      pairs.push({
        left: anchor,
        right: other,
        label: `${leftConcept.name} ↔ ${rightConcept.name}`,
      })
    }
  }

  addFrom(leftConceptId)
  addFrom(rightConceptId)
  return pairs
}
