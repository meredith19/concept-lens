package com.conceptlens.service;

import static com.conceptlens.service.ServiceTestData.REFUND_PATH;
import static com.conceptlens.service.ServiceTestData.RETURN_PATH;
import static com.conceptlens.service.ServiceTestData.mapping;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.conceptlens.repository.InMemoryMappingRepository;

class MappingIdGeneratorTest {

    private InMemoryMappingRepository mappings;
    private MappingIdGenerator generator;

    @BeforeEach
    void setUp() {
        mappings = new InMemoryMappingRepository();
        generator = new MappingIdGenerator(mappings);
    }

    @Test
    void startsTheSequenceWhenNothingIsStored() {
        assertThat(generator.next()).isEqualTo("rel_001");
    }

    @Test
    void continuesFromTheHighestNumberInUse() {
        mappings.create(mapping("rel_018", RETURN_PATH, REFUND_PATH));
        mappings.create(mapping("rel_033", RETURN_PATH, REFUND_PATH));

        assertThat(generator.next()).isEqualTo("rel_034");
    }

    @Test
    void ignoresIdsThatDoNotFollowTheSequence() {
        mappings.create(mapping("legacy-mapping", RETURN_PATH, REFUND_PATH));

        assertThat(generator.next()).isEqualTo("rel_001");
    }

    @Test
    void skipsAnIdThatIsSomehowAlreadyTaken() {
        mappings.create(mapping("rel_002", RETURN_PATH, REFUND_PATH));
        mappings.create(mapping("rel_001", RETURN_PATH, REFUND_PATH));

        assertThat(generator.next()).isEqualTo("rel_003");
    }
}
