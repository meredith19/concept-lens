package com.conceptlens.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.test.annotation.DirtiesContext;

class DemoControllerTest extends ApiTestSupport {

    private static final String SHIPPED_VS_DELIVERED =
            "/api/compare?left=fulfillment.shipped&right=delivery.delivered";

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void resetRestoresRemovedMappingsAndTheRelationshipsDerivedFromThem() {
        assertThat(get(SHIPPED_VS_DELIVERED).body().get("relationship").asString())
                .isEqualTo("RIGHT_INCLUDES_LEFT");

        assertThat(delete("/api/mappings/rel_024").status()).isEqualTo(204);
        assertThat(get("/api/mappings").body()).hasSize(5);
        assertThat(get(SHIPPED_VS_DELIVERED).body().get("relationship").asString())
                .isEqualTo("NOT_ESTABLISHED");

        Response reset = post("/api/demo/reset", null);

        assertThat(reset.status()).isEqualTo(204);
        assertThat(get("/api/mappings").body()).hasSize(6);
        assertThat(get("/api/mappings/rel_024").status()).isEqualTo(200);
        assertThat(get(SHIPPED_VS_DELIVERED).body().get("relationship").asString())
                .isEqualTo("RIGHT_INCLUDES_LEFT");
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void resetDiscardsMappingsAddedAtRuntime() {
        post(
                "/api/mappings",
                java.util.Map.of(
                        "leftFactId", "returns.returnable.within_return_window",
                        "rightFactId", "payments.refundable.return_approved",
                        "type", "SAME_MEANING",
                        "status", "CONFIRMED",
                        "rationale", "Same approval step.",
                        "reviewedBy", "Domain reviewer"));
        assertThat(get("/api/mappings").body()).hasSize(7);

        assertThat(post("/api/demo/reset", null).status()).isEqualTo(204);

        assertThat(get("/api/mappings").body()).hasSize(6);
        assertThat(get("/api/mappings/rel_035").status()).isEqualTo(404);
    }

    @Test
    void resetIsSafeToRepeatWhenNothingHasChanged() {
        assertThat(post("/api/demo/reset", null).status()).isEqualTo(204);
        assertThat(get("/api/mappings").body()).hasSize(6);
    }
}
