package com.conceptlens.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.test.annotation.DirtiesContext;

class ComparisonControllerTest extends ApiTestSupport {

    @Test
    void reportsContainmentWithTheEvidenceBehindIt() {
        Response response = get("/api/compare?left=fulfillment.shipped&right=delivery.delivered");

        assertThat(response.status()).isEqualTo(200);
        assertThat(response.body().get("relationship").asString()).isEqualTo("RIGHT_INCLUDES_LEFT");
        assertThat(response.body().get("matchedFacts")).hasSize(1);
        assertThat(response.body().get("matchedFacts").get(0).get("mapping").get("id").asString())
                .isEqualTo("rel_024");
        assertThat(response.body().get("unmatchedLeftFacts")).isEmpty();
        assertThat(response.body().get("unmatchedRightFacts")).hasSize(1);
    }

    @Test
    void reportsEquivalenceWhenEveryFactMatches() {
        Response response =
                get("/api/compare?left=orders.buyercountry&right=payments.billingcountry");

        assertThat(response.body().get("relationship").asString()).isEqualTo("SAME_MEANING");
        assertThat(response.body().get("matchedFacts")).hasSize(3);
        assertThat(response.body().get("unmatchedLeftFacts")).isEmpty();
        assertThat(response.body().get("unmatchedRightFacts")).isEmpty();
    }

    @Test
    void reportsNothingEstablishedWhenBothSidesKeepUnmatchedFacts() {
        Response response = get("/api/compare?left=returns.returnable&right=payments.refundable");

        assertThat(response.body().get("relationship").asString()).isEqualTo("NOT_ESTABLISHED");
        assertThat(response.body().get("matchedFacts")).hasSize(1);
        assertThat(response.body().get("unmatchedLeftFacts")).hasSize(2);
        assertThat(response.body().get("unmatchedRightFacts")).hasSize(2);
    }

    @Test
    void unknownConceptIsNotFound() {
        Response response = get("/api/compare?left=nope.missing&right=payments.refundable");

        assertThat(response.status()).isEqualTo(404);
        assertThat(response.body().get("code").asString()).isEqualTo("CONCEPT_NOT_FOUND");
    }

    @Test
    void missingParameterIsABadRequest() {
        Response response = get("/api/compare?left=returns.returnable");

        assertThat(response.status()).isEqualTo(400);
        assertThat(response.body().get("code").asString()).isEqualTo("MISSING_PARAMETER");
        assertThat(response.body().get("message").asString()).contains("right");
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void deletingTheMappingChangesTheNextComparison() {
        String compare = "/api/compare?left=fulfillment.shipped&right=delivery.delivered";
        assertThat(get(compare).body().get("relationship").asString())
                .isEqualTo("RIGHT_INCLUDES_LEFT");

        assertThat(delete("/api/mappings/rel_024").status()).isEqualTo(204);

        assertThat(get(compare).body().get("relationship").asString()).isEqualTo("NOT_ESTABLISHED");
        assertThat(get(compare).body().get("matchedFacts")).isEmpty();
    }
}
