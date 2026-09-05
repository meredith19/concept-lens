package com.conceptlens.comparison;

/**
 * How two concepts relate, derived by comparing which of their facts are confirmed as equivalent.
 *
 * <p>These values are never authored. Only fact-level equivalence is recorded; this reading of a
 * whole concept pair is computed from those mappings each time a comparison is made.
 */
public enum ConceptRelationship {

    /** Every fact on both sides is matched: the concepts mean the same thing. */
    SAME_MEANING,

    /** Every fact of the right concept is matched, and the left concept adds more. */
    LEFT_INCLUDES_RIGHT,

    /** Every fact of the left concept is matched, and the right concept adds more. */
    RIGHT_INCLUDES_LEFT,

    /**
     * Both concepts retain unmatched facts, so no relationship can be claimed.
     *
     * <p>This is deliberately not "different" or "partially overlapping". Unmatched facts are an
     * absence of evidence, and Concept Lens declines to characterise a pair it cannot support.
     */
    NOT_ESTABLISHED
}
