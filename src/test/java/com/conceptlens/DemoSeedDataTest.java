package com.conceptlens;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;

import com.conceptlens.model.Concept;
import com.conceptlens.model.Fact;
import com.conceptlens.model.MappingStatus;
import com.conceptlens.model.MappingType;
import com.conceptlens.model.SemanticMapping;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

/**
 * Guards the demo seed data in {@code src/main/resources/demo}.
 *
 * <p>Nothing loads these files yet, so without this test a malformed or dangling seed entry would
 * go unnoticed until the repositories are wired up. Deserialization uses the application's own
 * mapper, so the test fails if the files stop matching the model.
 */
@SpringBootTest
class DemoSeedDataTest {

    @Autowired
    private ObjectMapper objectMapper;

    private <T> List<T> readSeed(String resource, TypeReference<List<T>> type) throws Exception {
        try (InputStream in = new ClassPathResource(resource).getInputStream()) {
            return objectMapper.readValue(in, type);
        }
    }

    private List<Concept> concepts() throws Exception {
        return readSeed("demo/concepts.json", new TypeReference<List<Concept>>() {});
    }

    private List<SemanticMapping> mappings() throws Exception {
        return readSeed("demo/mappings.json", new TypeReference<List<SemanticMapping>>() {});
    }

    @Test
    void conceptsDeserializeCompletely() throws Exception {
        List<Concept> concepts = concepts();

        assertThat(concepts).isNotEmpty();
        assertThat(concepts).allSatisfy(concept -> {
            assertThat(concept.id()).isNotBlank();
            assertThat(concept.name()).isNotBlank();
            assertThat(concept.sourceSystem()).isNotBlank();
            assertThat(concept.definition()).isNotBlank();
            assertThat(concept.version()).isPositive();
            assertThat(concept.publishedAt()).isNotNull();
            assertThat(concept.facts()).isNotEmpty();
        });
    }

    @Test
    void mappingsDeserializeCompletely() throws Exception {
        List<SemanticMapping> mappings = mappings();

        assertThat(mappings).isNotEmpty();
        assertThat(mappings).allSatisfy(mapping -> {
            assertThat(mapping.id()).isNotBlank();
            assertThat(mapping.rationale()).isNotBlank();
            assertThat(mapping.reviewedBy()).isNotBlank();
            assertThat(mapping.type()).isEqualTo(MappingType.SAME_MEANING);
            assertThat(mapping.status()).isEqualTo(MappingStatus.CONFIRMED);
        });
    }

    @Test
    void factIdsAreUniqueAndQualifiedByTheirConcept() throws Exception {
        Map<String, String> conceptIdByFactId = new HashMap<>();

        for (Concept concept : concepts()) {
            for (Fact fact : concept.facts()) {
                assertThat(fact.label()).isNotBlank();
                assertThat(fact.description()).isNotBlank();
                assertThat(fact.id())
                        .as("fact id should be qualified by its concept")
                        .startsWith(concept.id() + ".");
                assertThat(conceptIdByFactId.put(fact.id(), concept.id()))
                        .as("fact id %s should be globally unique", fact.id())
                        .isNull();
            }
        }
    }

    @Test
    void everyMappingReferencesKnownFactsInDifferentConcepts() throws Exception {
        Map<String, String> conceptIdByFactId = new HashMap<>();
        for (Concept concept : concepts()) {
            concept.facts().forEach(fact -> conceptIdByFactId.put(fact.id(), concept.id()));
        }

        for (SemanticMapping mapping : mappings()) {
            assertThat(conceptIdByFactId)
                    .as("mapping %s references an unknown left fact", mapping.id())
                    .containsKey(mapping.leftFactId());
            assertThat(conceptIdByFactId)
                    .as("mapping %s references an unknown right fact", mapping.id())
                    .containsKey(mapping.rightFactId());
            assertThat(conceptIdByFactId.get(mapping.leftFactId()))
                    .as("mapping %s should relate two different concepts", mapping.id())
                    .isNotEqualTo(conceptIdByFactId.get(mapping.rightFactId()));
        }
    }
}
