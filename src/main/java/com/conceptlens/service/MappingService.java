package com.conceptlens.service;

import java.util.List;

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
 * mapping actually refers to facts that exist, that it relates two different source systems'
 * concepts rather than restating one concept's own vocabulary, and that within a concept pair a
 * fact has at most one confirmed mapping to the other concept.
 *
 * <p>Creates, deletes and resets share one lock so a validate-then-insert cannot interleave with
 * another write. That is in-process serialization for a single-user prototype, not a load-tested
 * concurrent store.
 *
 * <p>Changes apply to runtime state only; nothing is written back to the seed file.
 */
@Service
public class MappingService {

    private static final Logger log = LoggerFactory.getLogger(MappingService.class);

    private final MappingRepository mappingRepository;
    private final ConceptRepository conceptRepository;
    private final MappingIdGenerator mappingIdGenerator;
    private final Object writes = new Object();

    public MappingService(
            MappingRepository mappingRepository,
            ConceptRepository conceptRepository,
            MappingIdGenerator mappingIdGenerator) {
        this.mappingRepository = mappingRepository;
        this.conceptRepository = conceptRepository;
        this.mappingIdGenerator = mappingIdGenerator;
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
     * Records a new mapping, giving it an id, after checking it is a claim Concept Lens can stand
     * behind.
     *
     * @throws InvalidMappingException if any validation rule is broken
     */
    public SemanticMapping addMapping(MappingDraft draft) {
        synchronized (writes) {
            return addMapping(new SemanticMapping(
                    mappingIdGenerator.next(),
                    draft.leftFactId(),
                    draft.rightFactId(),
                    draft.type(),
                    draft.status(),
                    draft.rationale(),
                    draft.reviewedBy()));
        }
    }

    /**
     * Validates and stores a mapping that already has an id.
     *
     * <p>Package-private: ids are assigned by {@link MappingIdGenerator}, so callers outside the
     * service supply a {@link MappingDraft} and never choose an id themselves.
     */
    SemanticMapping addMapping(SemanticMapping mapping) {
        synchronized (writes) {
            validate(mapping);
            try {
                SemanticMapping created = mappingRepository.create(mapping);
                log.info(
                        "Added mapping {} relating {} and {}",
                        created.id(),
                        created.leftFactId(),
                        created.rightFactId());
                return created;
            } catch (IllegalArgumentException e) {
                throw invalid(e.getMessage());
            }
        }
    }

    /**
     * Removes a mapping from the runtime state.
     *
     * @throws MappingNotFoundException if no mapping has that id
     */
    public void removeMapping(String mappingId) {
        synchronized (writes) {
            if (!mappingRepository.deleteById(mappingId)) {
                log.debug("Mapping removal missed for id {}", mappingId);
                throw new MappingNotFoundException(mappingId);
            }
            log.info("Removed mapping {}", mappingId);
        }
    }

    /**
     * Replaces every held mapping with this set, as one store update.
     *
     * <p>Used to restore the seeded catalog. The mappings are trusted already — they are not
     * re-validated as drafts.
     */
    public void replaceAll(List<SemanticMapping> mappings) {
        synchronized (writes) {
            mappingRepository.replaceAll(mappings);
        }
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
        if (mapping.rationale() == null || mapping.rationale().isBlank()) {
            reject("Rationale must not be blank");
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
        if (mappedWithinPair(mapping.leftFactId(), left, right)) {
            reject("Fact %s is already mapped within this concept pair"
                    .formatted(mapping.leftFactId()));
        }
        if (mappedWithinPair(mapping.rightFactId(), left, right)) {
            reject("Fact %s is already mapped within this concept pair"
                    .formatted(mapping.rightFactId()));
        }
    }

    private void reject(String reason) {
        throw invalid(reason);
    }

    /**
     * Builds the exception for a refused mapping.
     *
     * <p>Logged at debug because a rejection is the service working correctly: the caller supplied
     * something invalid, the exception tells them so, and nothing here needs an operator's
     * attention.
     */
    private InvalidMappingException invalid(String reason) {
        log.debug("Rejected mapping: {}", reason);
        return new InvalidMappingException(reason);
    }

    /**
     * Finds the concept that owns a fact.
     *
     * <p>Scanning is deliberate: the fact id convention encodes its concept, but resolving against
     * the published concepts proves the fact genuinely exists rather than merely looking well
     * formed.
     */
    private Concept conceptOwning(String factId) {
        return conceptRepository.findAll().stream()
                .filter(concept -> concept.facts().stream()
                        .anyMatch(fact -> fact.id().equals(factId)))
                .findFirst()
                .orElseThrow(() -> invalid("No published fact with id " + factId));
    }

    /** True if these two facts are already mapped, in either direction. */
    private boolean equivalentMappingExists(String leftFactId, String rightFactId) {
        return mappingRepository.findAll().stream()
                .anyMatch(existing -> existing.relates(leftFactId, rightFactId));
    }

    /**
     * True if this fact already has a confirmed mapping to the other concept of this pair.
     *
     * <p>The same fact may still map to an equivalent fact owned by a different concept.
     */
    private boolean mappedWithinPair(String factId, Concept left, Concept right) {
        return mappingRepository.findAll().stream().anyMatch(existing -> {
            if (!existing.leftFactId().equals(factId) && !existing.rightFactId().equals(factId)) {
                return false;
            }
            Concept existingLeft = conceptOwning(existing.leftFactId());
            Concept existingRight = conceptOwning(existing.rightFactId());
            return (left.id().equals(existingLeft.id()) && right.id().equals(existingRight.id()))
                    || (left.id().equals(existingRight.id()) && right.id().equals(existingLeft.id()));
        });
    }
}
