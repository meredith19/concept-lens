package com.conceptlens.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.test.annotation.DirtiesContext;

class MappingControllerTest extends ApiTestSupport {

    /** The POST body carries no id: the backend assigns one. */
    private static Map<String, Object> draft(String leftFactId, String rightFactId) {
        return Map.of(
                "leftFactId", leftFactId,
                "rightFactId", rightFactId,
                "type", "SAME_MEANING",
                "status", "CONFIRMED",
                "rationale", "Both facts describe the same thing.",
                "reviewedBy", "Domain reviewer");
    }

    @Test
    void listsEverySeededMapping() {
        Response response = get("/api/mappings");

        assertThat(response.status()).isEqualTo(200);
        assertThat(response.body()).hasSize(6);
        assertThat(response.body().get(0).get("id").asString()).isEqualTo("rel_018");
        assertThat(response.body().get(0).get("type").asString()).isEqualTo("SAME_MEANING");
    }

    @Test
    void returnsASingleMapping() {
        Response response = get("/api/mappings/rel_024");

        assertThat(response.status()).isEqualTo(200);
        assertThat(response.body().get("leftFactId").asString())
                .isEqualTo("fulfillment.shipped.left_fulfillment_center");
        assertThat(response.body().get("reviewedBy").asString()).isEqualTo("Domain reviewer");
    }

    @Test
    void unknownMappingIsNotFound() {
        Response response = get("/api/mappings/rel_999");

        assertThat(response.status()).isEqualTo(404);
        assertThat(response.body().get("code").asString()).isEqualTo("MAPPING_NOT_FOUND");
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void createsAMappingWithAServerGeneratedId() {
        Response response = post(
                "/api/mappings",
                draft(
                        "returns.returnable.within_return_window",
                        "payments.refundable.return_approved"));

        assertThat(response.status()).isEqualTo(201);
        // The seed data ends at rel_034, so the next mapping continues the sequence.
        assertThat(response.body().get("id").asString()).isEqualTo("rel_035");
        assertThat(response.body().get("rationale").asString())
                .isEqualTo("Both facts describe the same thing.");
        assertThat(response.raw().headers().firstValue("Location"))
                .contains("/api/mappings/rel_035");

        assertThat(get("/api/mappings").body()).hasSize(7);
        assertThat(get("/api/mappings/rel_035").status()).isEqualTo(200);
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void ignoresAnyIdTheCallerTriesToSupply() {
        Map<String, Object> withId = new HashMap<>(
                draft("returns.returnable.within_return_window",
                        "payments.refundable.return_approved"));
        withId.put("id", "rel_999");

        Response response = post("/api/mappings", withId);

        assertThat(response.status()).isEqualTo(201);
        assertThat(response.body().get("id").asString()).isEqualTo("rel_035");
        assertThat(get("/api/mappings/rel_999").status()).isEqualTo(404);
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void deletesAMapping() {
        assertThat(delete("/api/mappings/rel_018").status()).isEqualTo(204);

        assertThat(get("/api/mappings/rel_018").status()).isEqualTo(404);
        assertThat(get("/api/mappings").body()).hasSize(5);
    }

    @Test
    void deletingAnUnknownMappingIsNotFound() {
        Response response = delete("/api/mappings/rel_999");

        assertThat(response.status()).isEqualTo(404);
        assertThat(response.body().get("code").asString()).isEqualTo("MAPPING_NOT_FOUND");
    }

    @Test
    void rejectsAMappingWhoseFactDoesNotExist() {
        Response response = post(
                "/api/mappings",
                draft("returns.returnable.no_such_fact",
                        "payments.refundable.return_approved"));

        assertThat(response.status()).isEqualTo(400);
        assertThat(response.body().get("code").asString()).isEqualTo("INVALID_MAPPING");
        assertThat(response.body().get("message").asString()).contains("no_such_fact");
        assertThat(get("/api/mappings").body()).hasSize(6);
    }

    @Test
    void rejectsAMappingBetweenFactsOfTheSameConcept() {
        Response response = post(
                "/api/mappings",
                draft("returns.returnable.valid_return_path",
                        "returns.returnable.not_final_sale"));

        assertThat(response.status()).isEqualTo(400);
        assertThat(response.body().get("message").asString()).contains("two different concepts");
    }

    @Test
    void rejectsAMappingThatAlreadyExistsInTheOppositeDirection() {
        Response response = post(
                "/api/mappings",
                draft("payments.refundable.refund_path_available",
                        "returns.returnable.valid_return_path"));

        assertThat(response.status()).isEqualTo(400);
        assertThat(response.body().get("message").asString()).contains("already mapped");
    }

    @Test
    void rejectsAMalformedBody() {
        Response response = postRaw("/api/mappings", "{ not json");

        assertThat(response.status()).isEqualTo(400);
        assertThat(response.body().get("code").asString()).isEqualTo("MALFORMED_REQUEST");
    }

    @Test
    void rejectsABlankRationale() {
        Map<String, Object> blank = new HashMap<>(
                draft(
                        "returns.returnable.within_return_window",
                        "payments.refundable.return_approved"));
        blank.put("rationale", "  ");

        Response response = post("/api/mappings", blank);

        assertThat(response.status()).isEqualTo(400);
        assertThat(response.body().get("code").asString()).isEqualTo("INVALID_MAPPING");
        assertThat(response.body().get("message").asString()).contains("Rationale must not be blank");
        assertThat(get("/api/mappings").body()).hasSize(6);
    }

    @Test
    void rejectsAMissingRationale() {
        Map<String, Object> missing = new HashMap<>(
                draft(
                        "returns.returnable.within_return_window",
                        "payments.refundable.return_approved"));
        missing.remove("rationale");

        Response response = post("/api/mappings", missing);

        assertThat(response.status()).isEqualTo(400);
        assertThat(response.body().get("code").asString()).isEqualTo("INVALID_MAPPING");
        assertThat(response.body().get("message").asString()).contains("Rationale must not be blank");
        assertThat(get("/api/mappings").body()).hasSize(6);
    }
}
