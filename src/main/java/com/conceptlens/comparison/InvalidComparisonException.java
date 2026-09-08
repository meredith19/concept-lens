package com.conceptlens.comparison;

/**
 * Thrown when a comparison is asked for two copies of the same concept.
 *
 * <p>The engine derives a relationship only from mappings between facts, and a mapping never
 * relates a concept to itself. Treating that pair as {@link ConceptRelationship#NOT_ESTABLISHED}
 * would look the same as two unrelated concepts, which is the wrong claim about identity.
 */
public class InvalidComparisonException extends RuntimeException {

    public InvalidComparisonException(String conceptId) {
        super("A comparison requires two different concepts; both sides are " + conceptId);
    }
}
