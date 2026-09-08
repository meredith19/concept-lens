package com.conceptlens.api;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.conceptlens.seed.SeedDataLoader;

/**
 * Lifecycle of the bundled demo data.
 *
 * <p>Mappings are mutable at runtime, so anyone exploring a shared instance can change what the
 * comparisons derive. Resetting restores the seeded set, which keeps the demo repeatable.
 */
@RestController
@RequestMapping("/api/demo")
public class DemoController {

    private final SeedDataLoader seedDataLoader;

    public DemoController(SeedDataLoader seedDataLoader) {
        this.seedDataLoader = seedDataLoader;
    }

    @PostMapping("/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetDemoData() {
        seedDataLoader.resetMappings();
    }
}
