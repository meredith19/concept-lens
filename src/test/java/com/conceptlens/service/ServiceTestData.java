package com.conceptlens.service;

import java.time.Instant;
import java.util.List;

import com.conceptlens.model.Concept;
import com.conceptlens.model.Fact;
import com.conceptlens.model.MappingStatus;
import com.conceptlens.model.MappingType;
import com.conceptlens.model.SemanticMapping;

/** Small fixture shared by the service tests, shaped like the demo seed data. */
final class ServiceTestData {

    static final String RETURN_PATH = "returns.returnable.valid_return_path";
    static final String RETURN_WINDOW = "returns.returnable.within_return_window";
    static final String REFUND_PATH = "payments.refundable.refund_path_available";
    static final String RETURN_APPROVED = "payments.refundable.return_approved";

    private ServiceTestData() {}

    static Concept returnable() {
        return new Concept(
                "returns.returnable",
                "Returnable",
                "Returns",
                "Whether an item can currently be returned.",
                1,
                Instant.parse("2026-01-14T09:12:00Z"),
                List.of(
                        new Fact(RETURN_PATH, "Has a valid return path", "A valid path exists."),
                        new Fact(RETURN_WINDOW, "Is within the return window", "Still returnable.")));
    }

    static Concept refundable() {
        return new Concept(
                "payments.refundable",
                "Refundable",
                "Payments",
                "Whether money can currently be refunded.",
                1,
                Instant.parse("2026-01-22T16:40:00Z"),
                List.of(
                        new Fact(REFUND_PATH, "Refund path available", "A refund path exists."),
                        new Fact(RETURN_APPROVED, "Return has been approved", "Approved.")));
    }

    static SemanticMapping mapping(String id, String leftFactId, String rightFactId) {
        return new SemanticMapping(
                id,
                leftFactId,
                rightFactId,
                MappingType.SAME_MEANING,
                MappingStatus.CONFIRMED,
                "Both facts describe the same thing.",
                "Domain reviewer");
    }
}
