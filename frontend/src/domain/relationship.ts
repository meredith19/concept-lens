import type { Comparison, Concept, RelationshipKind, RelationshipSummary } from './types.ts'

/**
 * Classifies two concepts by comparing their sets of meanings.
 *
 * Only meanings backed by an explicit mapping count as shared; nothing is inferred from
 * similar names.
 */
export function classify(a: Concept, b: Concept): Comparison {
  const shared = a.meanings.filter((meaning) => b.meanings.includes(meaning))
  const onlyA = a.meanings.filter((meaning) => !b.meanings.includes(meaning))
  const onlyB = b.meanings.filter((meaning) => !a.meanings.includes(meaning))

  let relationship: RelationshipKind
  if (onlyA.length === 0 && onlyB.length === 0) {
    relationship = 'SAME_MEANING'
  } else if (onlyA.length === 0 && shared.length > 0) {
    relationship = 'A_SUBSET_B'
  } else if (onlyB.length === 0 && shared.length > 0) {
    relationship = 'B_SUBSET_A'
  } else if (shared.length === 0) {
    relationship = 'DISJOINT'
  } else {
    relationship = 'PARTIAL_OVERLAP'
  }

  return { shared, onlyA, onlyB, relationship }
}

export function summarize(
  relationship: RelationshipKind,
  a: Concept,
  b: Concept,
): RelationshipSummary {
  switch (relationship) {
    case 'PARTIAL_OVERLAP':
      return {
        badge: 'PARTIAL OVERLAP',
        summary:
          'Some meanings are confirmed as shared, while others remain unmatched in the current model.',
      }
    case 'B_SUBSET_A':
      return {
        badge: 'CONTAINMENT',
        summary: `Everything implied by ${b.name} is also implied by ${a.name}; ${a.name} adds additional meanings.`,
      }
    case 'A_SUBSET_B':
      return {
        badge: 'CONTAINMENT',
        summary: `Everything implied by ${a.name} is also implied by ${b.name}; ${b.name} adds additional meanings.`,
      }
    case 'SAME_MEANING':
      return { badge: 'FULL OVERLAP', summary: 'The concepts imply exactly the same things.' }
    case 'DISJOINT':
      return { badge: 'NO OVERLAP', summary: 'The concepts have no meanings in common.' }
  }
}
