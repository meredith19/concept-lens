package com.conceptlens.api;

/**
 * The body returned for every failed request.
 *
 * @param code stable, machine-readable identifier for the kind of failure
 * @param message human-readable explanation, safe to show to a caller
 */
public record ErrorResponse(String code, String message) {}
