import { mappingTypeLabel } from '../api/labels.ts'
import type { ComparisonResult, Fact, FactMatch } from '../api/types.ts'

/**
 * Turns a comparison into the wording and shapes the UI shows.
 *
 * Nothing equivalent exists in the API — and shouldn't, since the copy is a reading of the
 * result — so it is derived here instead.
 */

export const SAME_MEANING = mappingTypeLabel('SAME_MEANING')
export const NO_MATCH = 'No confirmed match'

/** Which of the five diagrams a result should be drawn as. */
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
  /** Omitted where the title says everything; the count lives in the derivation link. */
  copy?: string
}

export function takeaway(result: ComparisonResult): Takeaway {
  const left = result.leftConcept.name
  const right = result.rightConcept.name

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
            title: 'They share some meaning, but the overall relationship is not established.',
          }
  }
}

export interface ImplicationRow {
  left: Fact | null
  relationship: string
  right: Fact | null
  /** Present on matched rows: the confirmed mapping behind the match. */
  match?: FactMatch
}

/** Matched pairs first, then what each side is left holding on its own. */
export function implicationRows(result: ComparisonResult): ImplicationRow[] {
  return [
    ...result.matchedFacts.map((match) => ({
      left: match.leftFact,
      relationship: SAME_MEANING,
      right: match.rightFact,
      match,
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

