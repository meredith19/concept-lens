package com.conceptlens.seed;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.conceptlens.model.Concept;
import com.conceptlens.model.MappingStatus;
import com.conceptlens.model.MappingType;
import com.conceptlens.model.SemanticMapping;
import com.conceptlens.repository.ConceptRepository;
import com.conceptlens.repository.MappingRepository;

/**
 * Checks that the seed data reaches the repositories through the real Spring wiring.
 *
 * <p>These tests only read. Mutation is covered by the repository unit tests, so that creating or
 * deleting a mapping here cannot leak into another test sharing this application context.
 */
@SpringBootTest
class SeedDataLoaderTest {

    @Autowired
    private ConceptRepository conceptRepository;

    @Autowired
    private MappingRepository mappingRepository;

    @Test
    void loadsEverySeedConceptAtStartup() {
        assertThat(conceptRepository.findAll())
                .hasSize(6)
                .extracting(Concept::id)
                .containsExactly(
                        "returns.returnable",
                        "payments.refundable",
                        "fulfillment.shipped",
                        "delivery.delivered",
                        "orders.buyercountry",
                        "payments.billingcountry");
    }

    @Test
    void loadsEverySeedMappingAtStartup() {
        assertThat(mappingRepository.findAll())
                .hasSize(6)
                .extracting(SemanticMapping::id)
                .containsExactly("rel_018", "rel_024", "rel_031", "rel_032", "rel_033", "rel_034");
    }

    @Test
    void findsAConceptByIdWithItsFactsIntact() {
        Concept concept = conceptRepository.findById("returns.returnable").orElseThrow();

        assertThat(concept.name()).isEqualTo("Returnable");
        assertThat(concept.sourceSystem()).isEqualTo("Returns");
        assertThat(concept.publishedAt()).isNotNull();
        assertThat(concept.facts())
                .hasSize(4)
                .first()
                .satisfies(fact -> {
                    assertThat(fact.id()).isEqualTo("returns.returnable.valid_return_path");
                    assertThat(fact.label()).isEqualTo("Has a valid return path");
                });
    }

    @Test
    void findsAMappingById() {
        SemanticMapping mapping = mappingRepository.findById("rel_018").orElseThrow();

        assertThat(mapping.leftFactId()).isEqualTo("returns.returnable.valid_return_path");
        assertThat(mapping.rightFactId()).isEqualTo("payments.refundable.refund_path_available");
        assertThat(mapping.type()).isEqualTo(MappingType.SAME_MEANING);
        assertThat(mapping.status()).isEqualTo(MappingStatus.CONFIRMED);
    }

    @Test
    void returnsEmptyForUnknownIds() {
        assertThat(conceptRepository.findById("nope.not_a_concept")).isEmpty();
        assertThat(mappingRepository.findById("rel_999")).isEmpty();
    }
}
