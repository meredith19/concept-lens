/** A concept as defined by one source system. */
export interface Concept {
  id: string
  name: string
  system: string
  definition: string
  /** The things this concept implies, in the source system's own words. */
  meanings: string[]
}

/** How two concepts' sets of meanings relate. */
export type RelationshipKind =
  | 'SAME_MEANING'
  | 'A_SUBSET_B'
  | 'B_SUBSET_A'
  | 'DISJOINT'
  | 'PARTIAL_OVERLAP'

export interface Comparison {
  shared: string[]
  onlyA: string[]
  onlyB: string[]
  relationship: RelationshipKind
}

/** Headline reading of a comparison, shown as a badge and a one-line summary. */
export interface RelationshipSummary {
  badge: string
  summary: string
}

export interface Takeaway {
  title: string
  copy: string
}

/** One meaning, named as its owning system names it. */
export interface Fact {
  name: string
  native?: string
}

/** A row of the "how does the right concept relate to the left" table. */
export interface ImplicationRow {
  left: Fact | null
  relationship: string
  right: Fact | null
}

/** Provenance shown underneath a comparison. */
export interface MappingEvidence {
  path: string
  meta: string
  note: string
}

export interface Mapping {
  id: string
  source: string
  target: string
  /** Glyph drawn between the two facts: '↕' for equivalence, '→' for implication. */
  connector: string
  relation: string
  tags: string[]
  /** Lowercase haystack backing the filter box. */
  search: string
}
