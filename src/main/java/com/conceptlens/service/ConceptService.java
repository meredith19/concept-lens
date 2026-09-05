package com.conceptlens.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.conceptlens.model.Concept;
import com.conceptlens.repository.ConceptRepository;

/**
 * Read access to published concepts.
 *
 * <p>Source systems own their concepts, so this service deliberately offers no way to create,
 * update or delete one. A lookup for an unknown id fails explicitly rather than returning null,
 * so callers cannot mistake "not published" for "no facts".
 */
@Service
public class ConceptService {

    private static final Logger log = LoggerFactory.getLogger(ConceptService.class);

    private final ConceptRepository conceptRepository;

    public ConceptService(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
    }

    /** Every concept published to Concept Lens, in publication order. */
    public List<Concept> getAllConcepts() {
        return conceptRepository.findAll();
    }

    /**
     * The concept with this id.
     *
     * @throws ConceptNotFoundException if no concept has been published with that id
     */
    public Concept getConcept(String conceptId) {
        return conceptRepository
                .findById(conceptId)
                .orElseThrow(() -> {
                    log.debug("Concept lookup missed for id {}", conceptId);
                    return new ConceptNotFoundException(conceptId);
                });
    }
}
