package com.conceptlens.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.conceptlens.model.Concept;
import com.conceptlens.model.MappingStatus;
import com.conceptlens.model.MappingType;
import com.conceptlens.model.SemanticMapping;
import com.conceptlens.repository.ConceptRepository;
import com.conceptlens.repository.MappingRepository;

/**
 * Reads and maintains the semantic mappings Concept Lens owns.
 *
 * <p>Mappings are the only thing the application may change, so this service is where the rules
 * about what counts as a valid claim live. It reads concepts in order to check that a proposed
 * mapping actually refers to facts that exist and that it relates two different source systems'
 * concepts rather than restating one concept's own vocabulary.
 *
 * <p>Changes apply to runtime state only; nothing is written back to the seed file.
 */
@Service
public class MappingService {

    private static final Logger log = LoggerFactory.getLogger(MappingService.class);

    private final MappingRepository mappingRepository;
    private final ConceptRepository conceptRepository;

    public MappingService(MappingRepository mappingRepository, ConceptRepository conceptRepository) {
        this.mappingRepository = mappingRepository;
        this.conceptRepository = conceptRepository;
    }

    /** Every mapping currently held, seeded ones first and runtime additions appended. */
    public List<SemanticMapping> getAllMappings() {
        return mappingRepository.findAll();
    }

    /**
     * The mapping with this id.
     *
     * @throws MappingNotFoundException if no mapping has that id
     */
    public SemanticMapping getMapping(String mappingId) {
        return mappingRepository
                .findById(mappingId)
                .orElseThrow(() -> {
                    log.debug("Mapping lookup missed for id {}", mappingId);
                    return new MappingNotFoundException(mappingId);
                });
    }

    /**
     * Records a new mapping after checking it is a claim Concept Lens can stand behind.
     *
     * @throws InvalidMappingException if any validation rule is broken
     */
    public SemanticMapping addMapping(SemanticMapping mapping) {
        validate(mapping);

        SemanticMapping created = mappingRepository.create(mapping);
        log.info(
                "Added mapping {} relating {} and {}",
                created.id(),
                created.leftFactId(),
                created.rightFactId());
        return created;
    }

    /**
     * Removes a mapping from the runtime state.
     *
     * @throws MappingNotFoundException if no mapping has that id
     */
    public void removeMapping(String mappingId) {
        if (!mappingRepository.deleteById(mappingId)) {
            log.debug("Mapping removal missed for id {}", mappingId);
            throw new MappingNotFoundException(mappingId);
        }
        log.info("Removed mapping {}", mappingId);
    }

    private void validate(SemanticMapping mapping) {
        if (mapping.type() != MappingType.SAME_MEANING) {
            reject("Mapping type must be %s but was %s"
                    .formatted(MappingType.SAME_MEANING, mapping.type()));
        }
        if (mapping.status() != MappingStatus.CONFIRMED) {
            reject("Mapping status must be %s but was %s"
                    .formatted(MappingStatus.CONFIRMED, mapping.status()));
        }
        if (mappingRepository.findById(mapping.id()).isPresent()) {
            reject("A mapping already exists with id " + mapping.id());
        }

        Concept left = conceptOwning(mapping.leftFactId());
        Concept right = conceptOwning(mapping.rightFactId());

        if (left.id().equals(right.id())) {
            reject("Both facts belong to concept %s; a mapping must relate two different concepts"
                    .formatted(left.id()));
        }
        if (equivalentMappingExists(mapping.leftFactId(), mapping.rightFactId())) {
            reject("These facts are already mapped: %s and %s"
                    .formatted(mapping.leftFactId(), mapping.rightFactId()));
        }
    }

    private void reject(String reason) {
        log.warn("Rejected mapping: {}", reason);
        throw new InvalidMappingException(reason);
    }

    /**
     * Finds the concept that owns a fact.
     *
     * <p>Scanning is deliberate: the fact id convention encodes its concept, but resolving against
     * the published concepts proves the fact genuinely exists rather than merely looking well
     * formed.
     */
    private Concept conceptOwning(String factId) {
        Optional<Concept> owner = conceptRepository.findAll().stream()
                .filter(concept -> concept.facts().stream()
                        .anyMatch(fact -> fact.id().equals(factId)))
                .findFirst();

        if (owner.isEmpty()) {
            reject("No published fact with id " + factId);
        }
        return owner.get();
    }

    /** True if these two facts are already mapped, in either direction. */
    private boolean equivalentMappingExists(String leftFactId, String rightFactId) {
        return mappingRepository.findAll().stream()
                .anyMatch(existing ->
                        (existing.leftFactId().equals(leftFactId)
                                        && existing.rightFactId().equals(rightFactId))
                                || (existing.leftFactId().equals(rightFactId)
                                        && existing.rightFactId().equals(leftFactId)));
    }
}
