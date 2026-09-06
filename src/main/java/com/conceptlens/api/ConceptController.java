package com.conceptlens.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.conceptlens.model.Concept;
import com.conceptlens.service.ConceptService;

/**
 * Read-only access to published concepts.
 *
 * <p>There are no write endpoints: source systems own their concepts, and Concept Lens only
 * reads what they publish.
 */
@RestController
@RequestMapping("/api/concepts")
public class ConceptController {

    private final ConceptService conceptService;

    public ConceptController(ConceptService conceptService) {
        this.conceptService = conceptService;
    }

    @GetMapping
    public List<Concept> getAllConcepts() {
        return conceptService.getAllConcepts();
    }

    @GetMapping("/{id}")
    public Concept getConcept(@PathVariable String id) {
        return conceptService.getConcept(id);
    }
}
