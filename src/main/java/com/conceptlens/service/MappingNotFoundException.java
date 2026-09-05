package com.conceptlens.service;

/** Thrown when a mapping id does not match anything Concept Lens holds. */
public class MappingNotFoundException extends RuntimeException {

    public MappingNotFoundException(String mappingId) {
        super("No mapping with id: " + mappingId);
    }
}
