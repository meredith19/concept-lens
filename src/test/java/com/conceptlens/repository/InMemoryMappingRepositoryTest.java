package com.conceptlens.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.conceptlens.model.MappingStatus;
import com.conceptlens.model.MappingType;
import com.conceptlens.model.SemanticMapping;

class InMemoryMappingRepositoryTest {

    private InMemoryMappingRepository repository;

    @BeforeEach
    void setUp() {
        repository = new InMemoryMappingRepository();
    }

    private static SemanticMapping mapping(String id) {
        return new SemanticMapping(
                id,
                "returns.returnable.within_return_window",
                "payments.refundable.return_approved",
                MappingType.SAME_MEANING,
                MappingStatus.CONFIRMED,
                "Both facts describe the same approval step.",
                "Domain reviewer");
    }

    @Test
    void startsEmpty() {
        assertThat(repository.findAll()).isEmpty();
    }

    @Test
    void createAddsAMappingToTheRuntimeState() {
        SemanticMapping created = repository.create(mapping("rel_100"));

        assertThat(created.id()).isEqualTo("rel_100");
        assertThat(repository.findAll()).containsExactly(created);
        assertThat(repository.findById("rel_100")).contains(created);
    }

    @Test
    void createRejectsADuplicateId() {
        repository.create(mapping("rel_100"));

        assertThatIllegalArgumentException()
                .isThrownBy(() -> repository.create(mapping("rel_100")))
                .withMessageContaining("rel_100");
        assertThat(repository.findAll()).hasSize(1);
    }

    @Test
    void createAppendsInInsertionOrder() {
        repository.create(mapping("rel_100"));
        repository.create(mapping("rel_101"));
        repository.create(mapping("rel_102"));

        assertThat(repository.findAll())
                .extracting(SemanticMapping::id)
                .containsExactly("rel_100", "rel_101", "rel_102");
    }

    @Test
    void deleteRemovesAMappingFromTheRuntimeState() {
        repository.create(mapping("rel_100"));
        repository.create(mapping("rel_101"));

        assertThat(repository.deleteById("rel_100")).isTrue();

        assertThat(repository.findById("rel_100")).isEmpty();
        assertThat(repository.findAll()).extracting(SemanticMapping::id).containsExactly("rel_101");
    }

    @Test
    void deleteReportsWhenNothingMatched() {
        assertThat(repository.deleteById("rel_999")).isFalse();
    }

    @Test
    void replaceAllSwapsTheHeldSetInOneStep() {
        repository.create(mapping("rel_100"));
        repository.create(mapping("rel_101"));

        repository.replaceAll(List.of(mapping("rel_200"), mapping("rel_201")));

        assertThat(repository.findAll())
                .extracting(SemanticMapping::id)
                .containsExactly("rel_200", "rel_201");
        assertThat(repository.findById("rel_100")).isEmpty();
    }

    @Test
    void findAllReturnsASnapshotThatCallersCannotMutate() {
        repository.create(mapping("rel_100"));

        var snapshot = repository.findAll();
        repository.create(mapping("rel_101"));

        assertThat(snapshot).hasSize(1);
        assertThat(repository.findAll()).hasSize(2);
    }
}
