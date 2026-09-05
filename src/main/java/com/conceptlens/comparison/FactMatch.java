package com.conceptlens.comparison;

import com.conceptlens.model.Fact;
import com.conceptlens.model.SemanticMapping;

/**
 * One confirmed semantic match between a fact of the left concept and a fact of the right.
 *
 * <p>The mapping that justifies the match is carried alongside the two facts, so a reader can see
 * not just that Concept Lens considers them equivalent but on whose authority: the mapping holds
 * the rationale and the reviewer.
 *
 * @param leftFact the matched fact belonging to the left concept
 * @param rightFact the matched fact belonging to the right concept
 * @param mapping the confirmed mapping that relates them
 */
public record FactMatch(Fact leftFact, Fact rightFact, SemanticMapping mapping) {}
