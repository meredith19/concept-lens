package com.conceptlens.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.conceptlens.service.ConceptNotFoundException;
import com.conceptlens.service.InvalidMappingException;
import com.conceptlens.service.MappingNotFoundException;

/**
 * Turns the application's exceptions into HTTP responses, so every failure leaves the API with
 * the same {@link ErrorResponse} shape.
 *
 * <p>Failures the caller can correct are logged at debug: the response already tells them what
 * went wrong, and they are not a sign of trouble. Only an unexpected failure is logged at error,
 * and its detail is kept out of the response body.
 */
@RestControllerAdvice
class RestExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);

    @ExceptionHandler(ConceptNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleConceptNotFound(ConceptNotFoundException e) {
        log.debug("Concept not found: {}", e.getMessage());
        return new ErrorResponse("CONCEPT_NOT_FOUND", e.getMessage());
    }

    @ExceptionHandler(MappingNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleMappingNotFound(MappingNotFoundException e) {
        log.debug("Mapping not found: {}", e.getMessage());
        return new ErrorResponse("MAPPING_NOT_FOUND", e.getMessage());
    }

    @ExceptionHandler(InvalidMappingException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleInvalidMapping(InvalidMappingException e) {
        log.debug("Invalid mapping: {}", e.getMessage());
        return new ErrorResponse("INVALID_MAPPING", e.getMessage());
    }

    /** A body that could not be parsed into the expected shape. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleUnreadableBody(HttpMessageNotReadableException e) {
        log.debug("Unreadable request body: {}", e.getMessage());
        return new ErrorResponse("MALFORMED_REQUEST", "Request body could not be read");
    }

    /** A required query parameter that was not supplied, such as compare's left or right. */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ErrorResponse handleMissingParameter(MissingServletRequestParameterException e) {
        log.debug("Missing request parameter: {}", e.getParameterName());
        return new ErrorResponse(
                "MISSING_PARAMETER", "Required parameter is missing: " + e.getParameterName());
    }

    /** A path that matches no endpoint and no static resource. */
    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ErrorResponse handleNoResource(NoResourceFoundException e) {
        log.debug("No handler for {}", e.getResourcePath());
        return new ErrorResponse("NOT_FOUND", "No such endpoint");
    }

    /**
     * Anything unexpected thrown by application code.
     *
     * <p>Scoped to {@link RuntimeException} rather than {@link Exception} on purpose. Spring MVC
     * signals wrong method, unsupported media type and similar with checked exceptions that
     * already carry the right status; catching those here would mask every one of them as a 500.
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    ErrorResponse handleUnexpected(RuntimeException e) {
        log.error("Unhandled failure serving request", e);
        return new ErrorResponse("INTERNAL_ERROR", "Unexpected error");
    }
}
