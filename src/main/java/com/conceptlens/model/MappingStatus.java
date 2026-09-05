package com.conceptlens.model;

/**
 * How far a {@link SemanticMapping} has progressed through review.
 *
 * <p>Concept Lens states a relationship only where one has been explicitly recorded and accepted.
 * The absence of a mapping is not a claim that two facts differ.
 */
public enum MappingStatus {

    /** Reviewed and accepted; safe to rely on when comparing concepts. */
    CONFIRMED
}
