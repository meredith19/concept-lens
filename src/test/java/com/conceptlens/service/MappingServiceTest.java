package com.conceptlens.service;

import static com.conceptlens.service.ServiceTestData.REFUND_PATH;
import static com.conceptlens.service.ServiceTestData.RETURN_APPROVED;
import static com.conceptlens.service.ServiceTestData.RETURN_PATH;
import static com.conceptlens.service.ServiceTestData.RETURN_WINDOW;
import static com.conceptlens.service.ServiceTestData.mapping;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.conceptlens.model.MappingStatus;
import com.conceptlens.model.MappingType;
import com.conceptlens.model.SemanticMapping;
import com.conceptlens.repository.InMemoryConceptRepository;
import com.conceptlens.repository.InMemoryMappingRepository;

class MappingServiceTest {

    private InMemoryMappingRepository mappings;
    private MappingService mappingService;

    @BeforeEach
    void setUp() {
        InMemoryConceptRepository concepts = new InMemoryConceptRepository();
        concepts.initialize(List.of(ServiceTestData.returnable(), ServiceTestData.refundable()));

        mappings = new InMemoryMappingRepository();
        mappings.create(mapping("rel_018", RETURN_PATH, REFUND_PATH));

        mappingService = new MappingService(mappings, concepts, new MappingIdGenerator(mappings));
    }

    // --- lookups ---------------------------------------------------------------------------

    @Test
    void getAllMappingsReturnsEverythingHeld() {
        assertThat(mappingService.getAllMappings())
                .extracting(SemanticMapping::id)
                .containsExactly("rel_018");
    }

    @Test
    void getMappingFindsAnExistingMapping() {
        SemanticMapping found = mappingService.getMapping("rel_018");

        assertThat(found.leftFactId()).isEqualTo(RETURN_PATH);
        assertThat(found.rightFactId()).isEqualTo(REFUND_PATH);
    }

    @Test
    void getMappingFailsExplicitlyForAnUnknownId() {
        assertThatExceptionOfType(MappingNotFoundException.class)
                .isThrownBy(() -> mappingService.getMapping("rel_999"))
                .withMessageContaining("rel_999");
    }

    // --- creation --------------------------------------------------------------------------

    @Test
    void addMappingGeneratesTheNextIdInSequence() {
        SemanticMapping created = mappingService.addMapping(
                new MappingDraft(
                        RETURN_WINDOW,
                        RETURN_APPROVED,
                        MappingType.SAME_MEANING,
                        MappingStatus.CONFIRMED,
                        "Same approval step.",
                        "Domain reviewer"));

        assertThat(created.id()).isEqualTo("rel_019");
        assertThat(created.leftFactId()).isEqualTo(RETURN_WINDOW);
        assertThat(mappingService.getMapping("rel_019")).isEqualTo(created);
    }

    @Test
    void addMappingValidatesADraftJustAsStrictly() {
        MappingDraft sameConcept = new MappingDraft(
                RETURN_PATH,
                RETURN_WINDOW,
                MappingType.SAME_MEANING,
                MappingStatus.CONFIRMED,
                "Reason.",
                "Domain reviewer");

        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(sameConcept))
                .withMessageContaining("two different concepts");
        assertThat(mappings.findAll()).hasSize(1);
    }

    @Test
    void addMappingStoresAValidMapping() {
        SemanticMapping created =
                mappingService.addMapping(mapping("rel_100", RETURN_WINDOW, RETURN_APPROVED));

        assertThat(created.id()).isEqualTo("rel_100");
        assertThat(mappingService.getAllMappings())
                .extracting(SemanticMapping::id)
                .containsExactly("rel_018", "rel_100");
        assertThat(mappingService.getMapping("rel_100")).isEqualTo(created);
    }

    @Test
    void addMappingRejectsAnUnknownLeftFact() {
        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(
                        mapping("rel_100", "returns.returnable.no_such_fact", RETURN_APPROVED)))
                .withMessageContaining("returns.returnable.no_such_fact");

        assertThat(mappings.findAll()).hasSize(1);
    }

    @Test
    void addMappingRejectsAnUnknownRightFact() {
        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(
                        mapping("rel_100", RETURN_WINDOW, "payments.refundable.no_such_fact")))
                .withMessageContaining("payments.refundable.no_such_fact");

        assertThat(mappings.findAll()).hasSize(1);
    }

    @Test
    void addMappingRejectsTwoFactsFromTheSameConcept() {
        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(
                        mapping("rel_100", RETURN_PATH, RETURN_WINDOW)))
                .withMessageContaining("two different concepts");

        assertThat(mappings.findAll()).hasSize(1);
    }

    @Test
    void addMappingRejectsADuplicateOfAnExistingMapping() {
        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(
                        mapping("rel_100", RETURN_PATH, REFUND_PATH)))
                .withMessageContaining("already mapped");

        assertThat(mappings.findAll()).hasSize(1);
    }

    @Test
    void addMappingRejectsADuplicateStatedInTheOppositeDirection() {
        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(
                        mapping("rel_100", REFUND_PATH, RETURN_PATH)))
                .withMessageContaining("already mapped");

        assertThat(mappings.findAll()).hasSize(1);
    }

    @Test
    void addMappingRejectsAReusedMappingId() {
        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(
                        mapping("rel_018", RETURN_WINDOW, RETURN_APPROVED)))
                .withMessageContaining("rel_018");

        assertThat(mappings.findAll()).hasSize(1);
    }

    @Test
    void addMappingRejectsAnUnsupportedType() {
        SemanticMapping withNoType = new SemanticMapping(
                "rel_100", RETURN_WINDOW, RETURN_APPROVED, null,
                MappingStatus.CONFIRMED, "Reason.", "Domain reviewer");

        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(withNoType))
                .withMessageContaining("type must be SAME_MEANING");
    }

    @Test
    void addMappingRejectsAnUnconfirmedStatus() {
        SemanticMapping unconfirmed = new SemanticMapping(
                "rel_100", RETURN_WINDOW, RETURN_APPROVED, MappingType.SAME_MEANING,
                null, "Reason.", "Domain reviewer");

        assertThatExceptionOfType(InvalidMappingException.class)
                .isThrownBy(() -> mappingService.addMapping(unconfirmed))
                .withMessageContaining("status must be CONFIRMED");
    }

    // --- removal ---------------------------------------------------------------------------

    @Test
    void removeMappingDeletesFromRuntimeState() {
        mappingService.removeMapping("rel_018");

        assertThat(mappingService.getAllMappings()).isEmpty();
        assertThatExceptionOfType(MappingNotFoundException.class)
                .isThrownBy(() -> mappingService.getMapping("rel_018"));
    }

    @Test
    void removeMappingFailsExplicitlyForAnUnknownId() {
        assertThatExceptionOfType(MappingNotFoundException.class)
                .isThrownBy(() -> mappingService.removeMapping("rel_999"))
                .withMessageContaining("rel_999");

        assertThat(mappings.findAll()).hasSize(1);
    }

    @Test
    void removingThenRecreatingAMappingIsAllowed() {
        mappingService.removeMapping("rel_018");

        SemanticMapping recreated =
                mappingService.addMapping(mapping("rel_018", RETURN_PATH, REFUND_PATH));

        assertThat(mappingService.getAllMappings()).containsExactly(recreated);
    }
}
