package com.conceptlens.repository;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.stereotype.Repository;

import com.conceptlens.model.Concept;

/**
 * Holds the published concepts in memory, keyed by concept id.
 *
 * <p>The map is built once from the seed data and then never changes, which mirrors the fact that
 * source systems own these definitions and this prototype only reads them. Insertion order is
 * preserved so listings stay in the order concepts were published to Concept Lens.
 *
 * <p>{@link #initialize(List)} is deliberately not part of {@link ConceptRepository}: it is a
 * bootstrap concern, not a runtime capability. Only the startup loader should reference this
 * class directly; everything else depends on the interface.
 */
@Repository
public class InMemoryConceptRepository implements ConceptRepository {

    private final AtomicBoolean initialized = new AtomicBoolean();

    /** Assigned once by {@link #initialize(List)}; volatile so other threads see it safely. */
    private volatile Map<String, Concept> conceptsById = Map.of();

    @Override
    public List<Concept> findAll() {
        return List.copyOf(conceptsById.values());
    }

    @Override
    public Optional<Concept> findById(String id) {
        return Optional.ofNullable(conceptsById.get(id));
    }

    /**
     * Seeds the repository with the published concepts. Called once during application startup.
     *
     * <p>After this call the stored concepts are read-only, which is why a second call is an
     * error rather than a silent replacement.
     *
     * @throws IllegalStateException if the repository has already been initialized
     * @throws IllegalArgumentException if two concepts share an id
     */
    public void initialize(List<Concept> concepts) {
        if (!initialized.compareAndSet(false, true)) {
            throw new IllegalStateException("Concepts have already been initialized");
        }

        Map<String, Concept> byId = new LinkedHashMap<>();
        for (Concept concept : concepts) {
            Concept clash = byId.putIfAbsent(concept.id(), concept);
            if (clash != null) {
                throw new IllegalArgumentException("Duplicate concept id: " + concept.id());
            }
        }
        conceptsById = Collections.unmodifiableMap(byId);
    }
}
