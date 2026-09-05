package com.conceptlens.model;

import java.time.Instant;
import java.util.List;

/**
 * A unit of meaning as defined and published by one source system.
 *
 * <p>Concepts are owned by their source system, not by Concept Lens. They keep that system's own
 * vocabulary: two systems may describe the same thing under different names, and Concept Lens
 * never rewrites either into a shared canonical form.
 *
 * <p>A concept is published as a versioned snapshot, and its facts are what it is composed of —
 * the individual statements that together make up its meaning.
 *
 * @param id identifier of the concept
 * @param name the concept's name in its source system's vocabulary
 * @param sourceSystem the system that owns this concept and publishes it to Concept Lens
 * @param definition prose description of what the concept means
 * @param version publication version, advanced by the source system on each republication
 * @param publishedAt the instant at which the source system published this version
 * @param facts the statements this concept is composed of; copied defensively, so neither the
 *     list nor any element may be null
 */
public record Concept(
        String id,
        String name,
        String sourceSystem,
        String definition,
        int version,
        Instant publishedAt,
        List<Fact> facts) {

    public Concept {
        facts = List.copyOf(facts);
    }
}
