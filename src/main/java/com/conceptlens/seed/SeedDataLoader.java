package com.conceptlens.seed;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.conceptlens.model.Concept;
import com.conceptlens.model.SemanticMapping;
import com.conceptlens.repository.InMemoryConceptRepository;
import com.conceptlens.repository.MappingRepository;
import com.conceptlens.service.MappingService;

import jakarta.annotation.PostConstruct;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

/**
 * Loads the demo seed data into the repositories once, at application startup.
 *
 * <p>The JSON under {@code demo/} is read-only input: concepts are handed to the concept
 * repository as its permanent contents, and each seed mapping is created in the mapping
 * repository. Nothing is ever written back, so restarting resets mappings to the seeded state.
 *
 * <p>A failure here is deliberately fatal. Starting with missing or malformed seed data would
 * leave the application running with a silently empty model.
 *
 * <p>This class depends on {@link InMemoryConceptRepository} concretely, because seeding is not
 * part of the read-only {@link com.conceptlens.repository.ConceptRepository} contract. That
 * exception is scoped to bootstrapping: runtime code such as a concept service depends on the
 * interface instead.
 *
 * <p>Startup writes each seed mapping through {@link MappingRepository#create} so a duplicate id
 * in the seed file fails the boot. Reset uses {@link MappingService#replaceAll}, which swaps the
 * whole set and would hide that check.
 */
@Component
public class SeedDataLoader {

    private static final Logger log = LoggerFactory.getLogger(SeedDataLoader.class);

    private static final String CONCEPTS_RESOURCE = "demo/concepts.json";
    private static final String MAPPINGS_RESOURCE = "demo/mappings.json";

    private final InMemoryConceptRepository conceptRepository;
    private final MappingRepository mappingRepository;
    private final MappingService mappingService;
    private final ObjectMapper objectMapper;
    private List<SemanticMapping> seedMappings = List.of();

    public SeedDataLoader(
            InMemoryConceptRepository conceptRepository,
            MappingRepository mappingRepository,
            MappingService mappingService,
            ObjectMapper objectMapper) {
        this.conceptRepository = conceptRepository;
        this.mappingRepository = mappingRepository;
        this.mappingService = mappingService;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void loadSeedData() {
        List<Concept> concepts = read(CONCEPTS_RESOURCE, new TypeReference<List<Concept>>() {});
        conceptRepository.initialize(concepts);

        seedMappings = List.copyOf(
                read(MAPPINGS_RESOURCE, new TypeReference<List<SemanticMapping>>() {}));
        seedMappings.forEach(mappingRepository::create);

        log.info("Loaded {} seed concepts and {} seed mappings", concepts.size(), seedMappings.size());
    }

    /**
     * Restores the mappings to their seeded state, discarding anything added or removed at
     * runtime. Concepts are untouched — they are read-only and cannot have drifted.
     *
     * <p>This exists so a shared demo instance stays explorable: one visitor removing a mapping
     * should not leave the next visitor with a different model.
     */
    public void resetMappings() {
        mappingService.replaceAll(seedMappings);
        log.info("Reset mappings to the seeded set of {}", seedMappings.size());
    }

    private <T> List<T> read(String resource, TypeReference<List<T>> type) {
        try (InputStream in = new ClassPathResource(resource).getInputStream()) {
            return objectMapper.readValue(in, type);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read seed data from " + resource, e);
        }
    }
}
