package com.conceptlens.repository;

import java.util.List;
import java.util.Optional;

import com.conceptlens.model.SemanticMapping;

/**
 * Storage for the semantic mappings Concept Lens owns.
 *
 * <p>Unlike concepts, mappings are Concept Lens' own knowledge and are mutable at runtime.
 * Changes apply to the running application's state only — no implementation writes back to the
 * seed file, so a restart returns the mappings to their seeded state.
 */
public interface MappingRepository {

    /** All mappings currently held, in the order they were added. */
    List<SemanticMapping> findAll();

    /** The mapping with this id, or empty if there is none. */
    Optional<SemanticMapping> findById(String id);

    /**
     * Adds a mapping to the runtime state.
     *
     * @return the stored mapping
     * @throws IllegalArgumentException if a mapping with the same id already exists
     */
    SemanticMapping create(SemanticMapping mapping);

    /**
     * Removes a mapping from the runtime state.
     *
     * @return {@code true} if a mapping was removed, {@code false} if none had that id
     */
    boolean deleteById(String id);
}
