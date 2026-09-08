package com.conceptlens.semantic;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.conceptlens.model.MappingStatus;
import com.conceptlens.model.MappingType;
import com.conceptlens.model.SemanticMapping;
import com.conceptlens.repository.MappingRepository;

/**
 * Answers questions about how facts relate, according to the mappings Concept Lens holds.
 *
 * <p>Every question is answered against the repository as it stands at the moment of the call, so
 * a mapping added or removed at runtime is reflected immediately. Nothing is cached or
 * precomputed: there is no index to rebuild or invalidate.
 *
 * <p>Only <em>direct</em> mappings are consulted. If A is mapped to B and B to C, this class does
 * not report A and C as having the same meaning — transitive reasoning is a separate decision
 * that has not been made.
 */
@Component
public class SemanticGraph {

    private final MappingRepository mappingRepository;

    public SemanticGraph(MappingRepository mappingRepository) {
        this.mappingRepository = mappingRepository;
    }

    /**
     * Whether two facts are currently held to state the same thing.
     *
     * <p>True only when a confirmed {@link MappingType#SAME_MEANING} mapping directly relates the
     * two facts. Because equivalence is symmetric, the order of the arguments does not matter.
     *
     * <p>An unmapped pair is false, which means "not established" rather than "different": the
     * absence of a mapping is an absence of evidence.
     */
    public boolean haveSameMeaning(String leftFactId, String rightFactId) {
        return findSameMeaningMapping(leftFactId, rightFactId).isPresent();
    }

    /**
     * The confirmed mapping that makes two facts equivalent, if there is one.
     *
     * <p>Same question as {@link #haveSameMeaning}, but returning the evidence rather than a
     * verdict, so a caller can show on whose authority the two facts are held to match. Keeping
     * both answers behind one search means the rule for what counts as equivalence is stated
     * once.
     */
    public Optional<SemanticMapping> findSameMeaningMapping(String leftFactId, String rightFactId) {
        return mappingRepository.findAll().stream()
                .filter(mapping -> mapping.type() == MappingType.SAME_MEANING)
                .filter(mapping -> mapping.status() == MappingStatus.CONFIRMED)
                .filter(mapping -> mapping.relates(leftFactId, rightFactId))
                .findFirst();
    }
}
