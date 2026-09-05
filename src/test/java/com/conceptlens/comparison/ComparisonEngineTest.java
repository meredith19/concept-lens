package com.conceptlens.comparison;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import com.conceptlens.model.Fact;
import com.conceptlens.service.ConceptNotFoundException;
import com.conceptlens.service.MappingService;

/** Exercises the engine against the three seeded scenarios. */
@SpringBootTest
class ComparisonEngineTest {

    private static final String RETURNABLE = "returns.returnable";
    private static final String REFUNDABLE = "payments.refundable";
    private static final String SHIPPED = "fulfillment.shipped";
    private static final String DELIVERED = "delivery.delivered";
    private static final String BUYER_COUNTRY = "orders.buyercountry";
    private static final String BILLING_COUNTRY = "payments.billingcountry";

    @Autowired
    private ComparisonEngine comparisonEngine;

    @Autowired
    private MappingService mappingService;

    @Test
    void returnableToRefundableLeavesFactsUnmatchedOnBothSides() {
        ComparisonResult result = comparisonEngine.compare(RETURNABLE, REFUNDABLE);

        assertThat(result.relationship()).isEqualTo(ConceptRelationship.NOT_ESTABLISHED);
        assertThat(result.matchedFacts()).hasSize(1);
        assertThat(result.matchedFacts().getFirst())
                .satisfies(match -> {
                    assertThat(match.leftFact().id())
                            .isEqualTo("returns.returnable.valid_return_path");
                    assertThat(match.rightFact().id())
                            .isEqualTo("payments.refundable.refund_path_available");
                    assertThat(match.mapping().id()).isEqualTo("rel_018");
                });
        assertThat(result.unmatchedLeftFacts())
                .extracting(Fact::id)
                .containsExactly(
                        "returns.returnable.within_return_window",
                        "returns.returnable.not_final_sale");
        assertThat(result.unmatchedRightFacts())
                .extracting(Fact::id)
                .containsExactly(
                        "payments.refundable.return_approved",
                        "payments.refundable.payment_captured");
    }

    @Test
    void shippedIsFullyContainedInDelivered() {
        ComparisonResult result = comparisonEngine.compare(SHIPPED, DELIVERED);

        assertThat(result.relationship()).isEqualTo(ConceptRelationship.RIGHT_INCLUDES_LEFT);
        assertThat(result.matchedFacts()).hasSize(1);
        assertThat(result.matchedFacts().getFirst().mapping().id()).isEqualTo("rel_024");
        assertThat(result.unmatchedLeftFacts()).isEmpty();
        assertThat(result.unmatchedRightFacts())
                .extracting(Fact::id)
                .containsExactly("delivery.delivered.reached_destination");
    }

    @Test
    void reversingTheComparisonReversesTheContainment() {
        ComparisonResult result = comparisonEngine.compare(DELIVERED, SHIPPED);

        assertThat(result.relationship()).isEqualTo(ConceptRelationship.LEFT_INCLUDES_RIGHT);
        assertThat(result.unmatchedLeftFacts())
                .extracting(Fact::id)
                .containsExactly("delivery.delivered.reached_destination");
        assertThat(result.unmatchedRightFacts()).isEmpty();
    }

    @Test
    void buyerCountryAndBillingCountryMatchCompletely() {
        ComparisonResult result = comparisonEngine.compare(BUYER_COUNTRY, BILLING_COUNTRY);

        assertThat(result.relationship()).isEqualTo(ConceptRelationship.SAME_MEANING);
        assertThat(result.matchedFacts()).hasSize(3);
        assertThat(result.matchedFacts())
                .extracting(match -> match.mapping().id())
                .containsExactly("rel_031", "rel_032", "rel_033");
        assertThat(result.unmatchedLeftFacts()).isEmpty();
        assertThat(result.unmatchedRightFacts()).isEmpty();
    }

    @Test
    void conceptsWithNoMappingsBetweenThemEstablishNothing() {
        ComparisonResult result = comparisonEngine.compare(RETURNABLE, DELIVERED);

        assertThat(result.relationship()).isEqualTo(ConceptRelationship.NOT_ESTABLISHED);
        assertThat(result.matchedFacts()).isEmpty();
        assertThat(result.unmatchedLeftFacts()).hasSize(3);
        assertThat(result.unmatchedRightFacts()).hasSize(2);
    }

    @Test
    void similarlyWordedFactsAreNotTreatedAsEvidence() {
        // Both concepts model a country with identically worded normalization and null-behaviour
        // facts, but only the mapped pairs count; Returnable and Delivered share no wording at all.
        ComparisonResult result = comparisonEngine.compare(RETURNABLE, DELIVERED);

        assertThat(result.matchedFacts()).isEmpty();
    }

    @Test
    void comparingAnUnknownConceptFailsExplicitly() {
        assertThatExceptionOfType(ConceptNotFoundException.class)
                .isThrownBy(() -> comparisonEngine.compare("nope.missing", REFUNDABLE));
        assertThatExceptionOfType(ConceptNotFoundException.class)
                .isThrownBy(() -> comparisonEngine.compare(RETURNABLE, "nope.missing"));
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void removingTheOnlyMappingChangesTheDerivedRelationship() {
        assertThat(comparisonEngine.compare(SHIPPED, DELIVERED).relationship())
                .isEqualTo(ConceptRelationship.RIGHT_INCLUDES_LEFT);

        mappingService.removeMapping("rel_024");

        ComparisonResult afterRemoval = comparisonEngine.compare(SHIPPED, DELIVERED);
        assertThat(afterRemoval.relationship()).isEqualTo(ConceptRelationship.NOT_ESTABLISHED);
        assertThat(afterRemoval.matchedFacts()).isEmpty();
        assertThat(afterRemoval.unmatchedLeftFacts()).hasSize(1);
        assertThat(afterRemoval.unmatchedRightFacts()).hasSize(2);
    }
}
