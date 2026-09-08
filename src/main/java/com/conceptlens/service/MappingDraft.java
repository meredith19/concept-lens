package com.conceptlens.service;

import com.conceptlens.model.MappingStatus;
import com.conceptlens.model.MappingType;

/**
 * A proposed mapping, before Concept Lens has given it an identity.
 *
 * <p>This is everything a caller supplies to create a mapping. The id is deliberately absent:
 * identifiers are Concept Lens' to assign, not the caller's to choose.
 *
 * @param leftFactId fully qualified id of one fact to relate
 * @param rightFactId fully qualified id of the other
 * @param type what the mapping claims; validated on creation
 * @param status how far it has been reviewed; validated on creation
 * @param rationale why the claim holds; must not be blank
 * @param reviewedBy who accepted it
 */
public record MappingDraft(
        String leftFactId,
        String rightFactId,
        MappingType type,
        MappingStatus status,
        String rationale,
        String reviewedBy) {}
