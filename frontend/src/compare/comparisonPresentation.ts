import type { ComparisonResult, Fact } from '../api/types.ts'

/**
 * Turns a comparison into the wording and shapes the UI shows.
 *
 * The mock carried hand-written copy for each demo pair. Nothing equivalent exists in the API —
 * and shouldn't, since the copy is a reading of the result — so it is derived here instead.
 */

export const SAME_MEANING = 'Same meaning'
export const NO_MATCH = 'No confirmed match'

/** Which of the mock's five diagrams a result should be drawn as. */
export type VennShape =
  | 'SAME_MEANING'
  | 'LEFT_INSIDE_RIGHT'
  | 'RIGHT_INSIDE_LEFT'
  | 'OVERLAP'
  | 'DISJOINT'

export function vennShape(result: ComparisonResult): VennShape {
  switch (result.relationship) {
    case 'SAME_MEANING':
      return 'SAME_MEANING'
    case 'RIGHT_INCLUDES_LEFT':
      return 'LEFT_INSIDE_RIGHT'
    case 'LEFT_INCLUDES_RIGHT':
      return 'RIGHT_INSIDE_LEFT'
    case 'NOT_ESTABLISHED':
      // Nothing confirmed in common is drawn as two separate circles; a partial set still
      // deserves the overlapping diagram even though no relationship is claimed.
      return result.matchedFacts.length === 0 ? 'DISJOINT' : 'OVERLAP'
  }
}

export interface Headline {
  badge: string
  summary: string
}

export function headline(result: ComparisonResult): Headline {
  const left = result.leftConcept.name
  const right = result.rightConcept.name

  switch (result.relationship) {
    case 'SAME_MEANING':
      return {
        badge: 'FULL OVERLAP',
        summary: 'Every fact on both sides is confirmed as shared.',
      }
    case 'RIGHT_INCLUDES_LEFT':
      return {
        badge: 'CONTAINMENT',
        summary: `Everything ${left} means is also meant by ${right}; ${right} adds more.`,
      }
    case 'LEFT_INCLUDES_RIGHT':
      return {
        badge: 'CONTAINMENT',
        summary: `Everything ${right} means is also meant by ${left}; ${left} adds more.`,
      }
    case 'NOT_ESTABLISHED':
      // The badge reports what the evidence shows; the summary and takeaway say what that does
      // and does not establish. Confirmed shared meaning is a fact worth stating even when it is
      // not enough to relate the concepts as a whole.
      return result.matchedFacts.length === 0
        ? {
            badge: 'NOT ESTABLISHED',
            summary: 'No confirmed mapping relates these concepts.',
          }
        : {
            badge: 'PARTIAL SHARED MEANING',
            summary:
              'Some facts are confirmed as shared, but both concepts keep facts with no confirmed match.',
          }
  }
}

export interface Takeaway {
  title: string
  copy: string
}

export function takeaway(result: ComparisonResult): Takeaway {
  const left = result.leftConcept.name
  const right = result.rightConcept.name
  const shared = result.matchedFacts.length

  switch (result.relationship) {
    case 'SAME_MEANING':
      return {
        title: 'Different names, same meaning.',
        copy: `The two systems use different vocabulary, but every modeled fact of ${left} and ${right} is confirmed as equivalent.`,
      }
    case 'RIGHT_INCLUDES_LEFT':
      return {
        title: `${right} is the stronger concept.`,
        copy: `${right} carries every confirmed meaning of ${left} and adds more, so ${left} holds wherever ${right} does but not the reverse.`,
      }
    case 'LEFT_INCLUDES_RIGHT':
      return {
        title: `${left} is the stronger concept.`,
        copy: `${left} carries every confirmed meaning of ${right} and adds more, so ${right} holds wherever ${left} does but not the reverse.`,
      }
    case 'NOT_ESTABLISHED':
      return result.matchedFacts.length === 0
        ? {
            title: 'Relationship unknown.',
            copy: 'No confirmed mapping relates these concepts. That is an absence of evidence, not evidence that they differ.',
          }
        : {
            title: 'They share meaning, but the relationship is not established.',
            copy: `${left} and ${right} have ${shared} confirmed shared ${shared === 1 ? 'meaning' : 'meanings'}. Their other facts have no confirmed match — unknown, not different — so no overall relationship is established.`,
          }
  }
}

export interface ImplicationRow {
  left: Fact | null
  relationship: string
  right: Fact | null
}

/** Matched pairs first, then what each side is left holding on its own. */
export function implicationRows(result: ComparisonResult): ImplicationRow[] {
  return [
    ...result.matchedFacts.map((match) => ({
      left: match.leftFact,
      relationship: SAME_MEANING,
      right: match.rightFact,
    })),
    ...result.unmatchedLeftFacts.map((fact) => ({
      left: fact,
      relationship: NO_MATCH,
      right: null,
    })),
    ...result.unmatchedRightFacts.map((fact) => ({
      left: null,
      relationship: NO_MATCH,
      right: fact,
    })),
  ]
}

export interface Evidence {
  path: string
  meta: string
  note: string
  /** The mapping behind the first confirmed match, if there is one. */
  mappingId: string | undefined
}

export function evidence(result: ComparisonResult): Evidence {
  const first = result.matchedFacts[0]

  if (!first) {
    return {
      path: 'No confirmed mapping for this pair',
      meta: 'Unknown',
      note: 'Concept Lens does not infer semantic relationships merely from similar names.',
      mappingId: undefined,
    }
  }

  const unmatched =
    result.unmatchedLeftFacts.length + result.unmatchedRightFacts.length > 0
      ? 'Unmatched facts are not automatically treated as different. Concept Lens only claims relationships supported by explicit mappings.'
      : 'Every fact on both sides is backed by an explicit mapping.'

  return {
    path: `${first.leftFact.id} ↔ ${first.rightFact.id}`,
    meta: `${SAME_MEANING} · Confirmed · ${first.mapping.reviewedBy}`,
    note: unmatched,
    mappingId: first.mapping.id,
  }
}
