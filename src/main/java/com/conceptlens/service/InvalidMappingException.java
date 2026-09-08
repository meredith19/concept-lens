package com.conceptlens.service;

/**
 * Thrown when a proposed mapping would not be a valid claim.
 *
 * <p>The message names the specific rule that was broken, because every one of them is something
 * the caller can correct: an unresolvable fact, two facts from the same concept, a blank
 * rationale, an unsupported type or status, a mapping that already exists, or a fact that is
 * already mapped within the same concept pair.
 */
public class InvalidMappingException extends RuntimeException {

    public InvalidMappingException(String message) {
        super(message);
    }
}
