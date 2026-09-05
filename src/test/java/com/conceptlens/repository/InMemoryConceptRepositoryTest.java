package com.conceptlens.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.assertj.core.api.Assertions.assertThatIllegalStateException;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.conceptlens.model.Concept;
import com.conceptlens.model.Fact;

class InMemoryConceptRepositoryTest {

    private InMemoryConceptRepository repository;

    @BeforeEach
    void setUp() {
        repository = new InMemoryConceptRepository();
    }

    private static Concept concept(String id, String name) {
        return new Concept(
                id,
                name,
                "Returns",
                "A test concept.",
                1,
                Instant.parse("2026-01-14T09:12:00Z"),
                List.of(new Fact(id + ".a_fact", "A fact", "Something the concept asserts.")));
    }

    @Test
    void startsEmptyUntilInitialized() {
        assertThat(repository.findAll()).isEmpty();
        assertThat(repository.findById("returns.returnable")).isEmpty();
    }

    @Test
    void initializeStoresConceptsInPublicationOrder() {
        repository.initialize(List.of(concept("a", "First"), concept("b", "Second")));

        assertThat(repository.findAll()).extracting(Concept::id).containsExactly("a", "b");
        assertThat(repository.findById("b")).map(Concept::name).contains("Second");
    }

    @Test
    void conceptsAreReadOnlyAfterInitialization() {
        repository.initialize(List.of(concept("a", "First")));

        assertThatIllegalStateException()
                .isThrownBy(() -> repository.initialize(List.of(concept("b", "Second"))));
        assertThat(repository.findAll()).extracting(Concept::id).containsExactly("a");
    }

    @Test
    void initializeRejectsDuplicateConceptIds() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> repository.initialize(List.of(concept("a", "First"), concept("a", "Clash"))))
                .withMessageContaining("a");
    }
}
