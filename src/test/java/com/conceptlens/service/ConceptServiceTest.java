package com.conceptlens.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.conceptlens.model.Concept;
import com.conceptlens.repository.InMemoryConceptRepository;

class ConceptServiceTest {

    private ConceptService conceptService;

    @BeforeEach
    void setUp() {
        InMemoryConceptRepository concepts = new InMemoryConceptRepository();
        concepts.initialize(List.of(ServiceTestData.returnable(), ServiceTestData.refundable()));
        conceptService = new ConceptService(concepts);
    }

    @Test
    void getAllConceptsReturnsEveryPublishedConcept() {
        assertThat(conceptService.getAllConcepts())
                .extracting(Concept::id)
                .containsExactly("returns.returnable", "payments.refundable");
    }

    @Test
    void getConceptFindsAPublishedConcept() {
        Concept concept = conceptService.getConcept("returns.returnable");

        assertThat(concept.name()).isEqualTo("Returnable");
        assertThat(concept.sourceSystem()).isEqualTo("Returns");
        assertThat(concept.facts()).hasSize(2);
    }

    @Test
    void getConceptFailsExplicitlyForAnUnknownId() {
        assertThatExceptionOfType(ConceptNotFoundException.class)
                .isThrownBy(() -> conceptService.getConcept("nope.missing"))
                .withMessageContaining("nope.missing");
    }
}
