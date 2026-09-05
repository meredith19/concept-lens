package com.conceptlens.model;

/**
 * What a {@link SemanticMapping} claims about the two facts it joins.
 *
 * <p>Equivalence is the only relationship anyone authors. Stronger or weaker readings of how two
 * <em>concepts</em> relate — containment, partial overlap, disjointness — are derived by comparing
 * which of their facts are joined by confirmed mappings, so they never appear here.
 */
public enum MappingType {

    /** Both facts state the same thing, each in its own system's vocabulary. */
    SAME_MEANING
}
