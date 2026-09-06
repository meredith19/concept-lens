package com.conceptlens.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ConceptControllerTest extends ApiTestSupport {

    @Test
    void listsEveryPublishedConcept() {
        Response response = get("/api/concepts");

        assertThat(response.status()).isEqualTo(200);
        assertThat(response.body()).hasSize(6);
        assertThat(response.body().get(0).get("id").asString()).isEqualTo("returns.returnable");
        assertThat(response.body().get(0).get("sourceSystem").asString()).isEqualTo("Returns");
    }

    @Test
    void returnsASingleConceptWithItsFacts() {
        Response response = get("/api/concepts/returns.returnable");

        assertThat(response.status()).isEqualTo(200);
        assertThat(response.body().get("name").asString()).isEqualTo("Returnable");
        assertThat(response.body().get("publishedAt").asString()).isEqualTo("2026-01-14T09:12:00Z");
        assertThat(response.body().get("facts")).hasSize(3);
        assertThat(response.body().get("facts").get(0).get("id").asString())
                .isEqualTo("returns.returnable.valid_return_path");
    }

    @Test
    void dottedConceptIdsSurviveThePathVariable() {
        // Concept ids contain dots; the whole segment must reach the service intact.
        assertThat(get("/api/concepts/payments.billingcountry").body().get("name").asString())
                .isEqualTo("BillingCountry");
    }

    @Test
    void unknownConceptIsNotFound() {
        Response response = get("/api/concepts/nope.missing");

        assertThat(response.status()).isEqualTo(404);
        assertThat(response.body().get("code").asString()).isEqualTo("CONCEPT_NOT_FOUND");
        assertThat(response.body().get("message").asString()).contains("nope.missing");
    }
}
