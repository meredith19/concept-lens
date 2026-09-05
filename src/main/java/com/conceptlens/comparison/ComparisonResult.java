package com.conceptlens.comparison;

import java.util.List;

import com.conceptlens.model.Concept;
import com.conceptlens.model.Fact;

/**
 * The outcome of comparing two concepts.
 *
 * <p>The result is deliberately more than a verdict. Alongside the derived relationship it carries
 * the evidence that produced it — which facts matched and on what authority, and which facts on
 * each side went unmatched — so a reader can check the reasoning rather than take it on trust.
 *
 * @param leftConcept the concept compared on the left
 * @param rightConcept the concept compared on the right
 * @param relationship the derived reading of the pair
 * @param matchedFacts facts confirmed as equivalent across the two concepts
 * @param unmatchedLeftFacts facts of the left concept with no confirmed match
 * @param unmatchedRightFacts facts of the right concept with no confirmed match
 */
public record ComparisonResult(
        Concept leftConcept,
        Concept rightConcept,
        ConceptRelationship relationship,
        List<FactMatch> matchedFacts,
        List<Fact> unmatchedLeftFacts,
        List<Fact> unmatchedRightFacts) {

    public ComparisonResult {
        matchedFacts = List.copyOf(matchedFacts);
        unmatchedLeftFacts = List.copyOf(unmatchedLeftFacts);
        unmatchedRightFacts = List.copyOf(unmatchedRightFacts);
    }
}
