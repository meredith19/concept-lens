package com.conceptlens.repository;

import java.util.List;
import java.util.Optional;

import com.conceptlens.model.Concept;

/**
 * Read access to the concepts published to Concept Lens.
 *
 * <p>Concepts are owned by their source systems, so this is a strictly read-only runtime
 * contract: there is no way to create, update or delete one through it. Seeding is not part of
 * the contract either — the in-memory implementation carries its own bootstrap method, used only
 * at startup.
 *
 * <p>Application code depends on this interface, never on a concrete implementation.
 */
public interface ConceptRepository {

    /** All known concepts, in the order they were published to Concept Lens. */
    List<Concept> findAll();

    /** The concept with this id, or empty if no such concept has been published. */
    Optional<Concept> findById(String id);
}
