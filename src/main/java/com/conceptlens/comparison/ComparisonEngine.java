package com.conceptlens.comparison;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.conceptlens.model.Concept;
import com.conceptlens.model.Fact;
import com.conceptlens.model.SemanticMapping;
import com.conceptlens.semantic.SemanticGraph;
import com.conceptlens.service.ConceptService;

/**
 * Derives how two concepts relate from the confirmed mappings between their facts.
 *
 * <p>Nothing here reads names, labels or descriptions. A pair of facts counts as matched only
 * when {@link SemanticGraph} finds a direct confirmed equivalence between them, so two facts that
 * happen to be worded alike are treated exactly like two that are not. The absence of a mapping
 * means unknown, never different — which is why an unmatched fact on both sides yields
 * {@link ConceptRelationship#NOT_ESTABLISHED} rather than a claim of partial overlap.
 */
@Service
public class ComparisonEngine {

    private final ConceptService conceptService;
    private final SemanticGraph semanticGraph;

    public ComparisonEngine(ConceptService conceptService, SemanticGraph semanticGraph) {
        this.conceptService = conceptService;
        this.semanticGraph = semanticGraph;
    }

    /**
     * Compares two published concepts.
     *
     * <p>The result is computed fresh from the mappings held at the moment of the call, so
     * adding or removing a mapping changes the next comparison.
     *
     * @throws com.conceptlens.service.ConceptNotFoundException if either id is unknown
     */
    public ComparisonResult compare(String leftConceptId, String rightConceptId) {
        Concept left = conceptService.getConcept(leftConceptId);
        Concept right = conceptService.getConcept(rightConceptId);

        List<FactMatch> matchedFacts = new ArrayList<>();
        List<Fact> unmatchedLeftFacts = new ArrayList<>();
        Set<String> matchedRightFactIds = new LinkedHashSet<>();

        for (Fact leftFact : left.facts()) {
            boolean matched = false;
            for (Fact rightFact : right.facts()) {
                SemanticMapping evidence = semanticGraph
                        .findSameMeaningMapping(leftFact.id(), rightFact.id())
                        .orElse(null);
                if (evidence != null) {
                    matchedFacts.add(new FactMatch(leftFact, rightFact, evidence));
                    matchedRightFactIds.add(rightFact.id());
                    matched = true;
                }
            }
            if (!matched) {
                unmatchedLeftFacts.add(leftFact);
            }
        }

        List<Fact> unmatchedRightFacts = right.facts().stream()
                .filter(fact -> !matchedRightFactIds.contains(fact.id()))
                .toList();

        ConceptRelationship relationship =
                derive(unmatchedLeftFacts.isEmpty(), unmatchedRightFacts.isEmpty());

        return new ComparisonResult(
                left, right, relationship, matchedFacts, unmatchedLeftFacts, unmatchedRightFacts);
    }

    /**
     * Reads the relationship from which side, if either, has been fully accounted for.
     *
     * <p>A concept whose every fact is matched is entirely contained in the other, so the side
     * with facts left over is the broader one.
     */
    private static ConceptRelationship derive(boolean allLeftMatched, boolean allRightMatched) {
        if (allLeftMatched && allRightMatched) {
            return ConceptRelationship.SAME_MEANING;
        }
        if (allLeftMatched) {
            return ConceptRelationship.RIGHT_INCLUDES_LEFT;
        }
        if (allRightMatched) {
            return ConceptRelationship.LEFT_INCLUDES_RIGHT;
        }
        return ConceptRelationship.NOT_ESTABLISHED;
    }
}
