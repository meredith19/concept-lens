package com.conceptlens.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.conceptlens.comparison.ComparisonEngine;
import com.conceptlens.comparison.ComparisonResult;

/** Derives how two published concepts relate. */
@RestController
@RequestMapping("/api/compare")
public class ComparisonController {

    private final ComparisonEngine comparisonEngine;

    public ComparisonController(ComparisonEngine comparisonEngine) {
        this.comparisonEngine = comparisonEngine;
    }

    @GetMapping
    public ComparisonResult compare(
            @RequestParam("left") String leftConceptId,
            @RequestParam("right") String rightConceptId) {
        return comparisonEngine.compare(leftConceptId, rightConceptId);
    }
}
