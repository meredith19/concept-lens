package com.conceptlens.model;

/**
 * A relationship between two facts owned by different source systems.
 *
 * <p>Unlike concepts, mappings are owned by Concept Lens. They are the only place a cross-system
 * claim is recorded, and each carries its own provenance so a reader can see why the claim is
 * believed.
 *
 * <p>Mappings name facts by id and never embed a source concept, so the source system remains the
 * sole owner of its definitions and a mapping cannot hold a stale copy of them. Mappings are also
 * deliberately fact-level: how two whole concepts relate is derived from the mappings between
 * their facts and is not stored here.
 *
 * @param id identifier of the mapping
 * @param leftFactId fully qualified id of one related fact
 * @param rightFactId fully qualified id of the other related fact; for {@link
 *     MappingType#SAME_MEANING} the relationship is symmetric, so left and right carry no meaning
 *     beyond telling the two sides apart
 * @param type what this mapping claims about the two facts
 * @param status how far the mapping has progressed through review
 * @param rationale why the claim holds, recorded for whoever reads it later
 * @param reviewedBy who accepted the mapping
 */
public record SemanticMapping(
        String id,
        String leftFactId,
        String rightFactId,
        MappingType type,
        MappingStatus status,
        String rationale,
        String reviewedBy) {}
