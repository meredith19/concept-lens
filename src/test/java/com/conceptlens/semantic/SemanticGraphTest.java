package com.conceptlens.semantic;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import com.conceptlens.service.MappingService;

/**
 * Exercises the graph against the real seeded mappings.
 *
 * <p>The removal test mutates shared runtime state, so it dirties the context afterwards rather
 * than leaving a missing mapping for whichever test class runs next.
 */
@SpringBootTest
class SemanticGraphTest {

    private static final String RETURN_PATH = "returns.returnable.valid_return_path";
    private static final String REFUND_PATH = "payments.refundable.refund_path_available";
    private static final String RETURN_WINDOW = "returns.returnable.within_return_window";
    private static final String PAYMENT_CAPTURED = "payments.refundable.payment_captured";

    @Autowired
    private SemanticGraph semanticGraph;

    @Autowired
    private MappingService mappingService;

    @Test
    void seededMappedFactsHaveTheSameMeaning() {
        assertThat(semanticGraph.haveSameMeaning(RETURN_PATH, REFUND_PATH)).isTrue();
    }

    @Test
    void equivalenceIsSymmetric() {
        assertThat(semanticGraph.haveSameMeaning(REFUND_PATH, RETURN_PATH)).isTrue();
    }

    @Test
    void unmappedFactsDoNotHaveTheSameMeaning() {
        assertThat(semanticGraph.haveSameMeaning(RETURN_WINDOW, PAYMENT_CAPTURED)).isFalse();
    }

    @Test
    void unknownFactIdsDoNotHaveTheSameMeaning() {
        assertThat(semanticGraph.haveSameMeaning("nope.not_a_fact", REFUND_PATH)).isFalse();
    }

    @Test
    void aFactIsNotEquivalentToItselfWithoutAMapping() {
        assertThat(semanticGraph.haveSameMeaning(RETURN_PATH, RETURN_PATH)).isFalse();
    }

    @Test
    void equivalenceIsNotTransitiveAcrossTwoMappings() {
        // rel_031 relates buyercountry.payment_instrument_country to billingcountry.billing_country,
        // and rel_032 relates the two normalization facts. Nothing joins across those pairs.
        assertThat(semanticGraph.haveSameMeaning(
                        "orders.buyercountry.payment_instrument_country",
                        "payments.billingcountry.country_normalization"))
                .isFalse();
    }

    @Test
    void findSameMeaningMappingReturnsTheEvidenceBehindAMatch() {
        assertThat(semanticGraph.findSameMeaningMapping(RETURN_PATH, REFUND_PATH))
                .hasValueSatisfying(mapping -> {
                    assertThat(mapping.id()).isEqualTo("rel_018");
                    assertThat(mapping.reviewedBy()).isEqualTo("Domain reviewer");
                });
    }

    @Test
    void findSameMeaningMappingIsSymmetricAndEmptyWhenUnmapped() {
        assertThat(semanticGraph.findSameMeaningMapping(REFUND_PATH, RETURN_PATH))
                .map(mapping -> mapping.id())
                .contains("rel_018");
        assertThat(semanticGraph.findSameMeaningMapping(RETURN_WINDOW, PAYMENT_CAPTURED)).isEmpty();
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void removingAMappingIsReflectedWithoutRebuildingTheGraph() {
        assertThat(semanticGraph.haveSameMeaning(RETURN_PATH, REFUND_PATH)).isTrue();

        mappingService.removeMapping("rel_018");

        assertThat(semanticGraph.haveSameMeaning(RETURN_PATH, REFUND_PATH)).isFalse();
        assertThat(semanticGraph.haveSameMeaning(REFUND_PATH, RETURN_PATH)).isFalse();
    }
}
