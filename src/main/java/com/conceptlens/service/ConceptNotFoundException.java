package com.conceptlens.service;

/** Thrown when a concept id does not match anything published to Concept Lens. */
public class ConceptNotFoundException extends RuntimeException {

    public ConceptNotFoundException(String conceptId) {
        super("No concept published with id: " + conceptId);
    }
}
