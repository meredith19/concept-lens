/** Shapes returned by the Concept Lens API, mirroring the Java model. */

export interface Fact {
  id: string
  label: string
  description: string
}

export interface Concept {
  id: string
  name: string
  sourceSystem: string
  definition: string
  version: number
  /** ISO-8601 instant. */
  publishedAt: string
  facts: Fact[]
}

export type MappingType = 'SAME_MEANING'

export type MappingStatus = 'CONFIRMED'

/** What a caller supplies to create a mapping. The backend assigns the id. */
export interface MappingDraft {
  leftFactId: string
  rightFactId: string
  type: MappingType
  status: MappingStatus
  rationale: string
  reviewedBy: string
}

export interface SemanticMapping {
  id: string
  leftFactId: string
  rightFactId: string
  type: MappingType
  status: MappingStatus
  rationale: string
  reviewedBy: string
}

export type ConceptRelationship =
  | 'SAME_MEANING'
  | 'LEFT_INCLUDES_RIGHT'
  | 'RIGHT_INCLUDES_LEFT'
  | 'NOT_ESTABLISHED'

export interface FactMatch {
  leftFact: Fact
  rightFact: Fact
  mapping: SemanticMapping
}

export interface ComparisonResult {
  leftConcept: Concept
  rightConcept: Concept
  relationship: ConceptRelationship
  matchedFacts: FactMatch[]
  unmatchedLeftFacts: Fact[]
  unmatchedRightFacts: Fact[]
}
