package com.conceptlens.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.conceptlens.model.SemanticMapping;
import com.conceptlens.repository.MappingRepository;

/**
 * Assigns ids to new mappings.
 *
 * <p>Deliberately simple: the next id continues the numbering already in use, so the seeded
 * {@code rel_033} is followed by {@code rel_034}. Deriving it from what the repository currently
 * holds rather than from a counter keeps the result predictable and leaves no state to get out of
 * step with the data.
 *
 * <p>The consequence, acceptable for a prototype, is that deleting the highest-numbered mapping
 * frees its id for reuse. A persisted system would want a sequence that never goes backwards.
 */
@Component
public class MappingIdGenerator {

    private static final String PREFIX = "rel_";
    private static final Pattern NUMBERED = Pattern.compile("^" + PREFIX + "(\\d+)$");

    private final MappingRepository mappingRepository;

    public MappingIdGenerator(MappingRepository mappingRepository) {
        this.mappingRepository = mappingRepository;
    }

    /** The next unused id in the {@code rel_NNN} sequence. */
    public String next() {
        int candidate = highestInUse();
        String id;
        do {
            candidate++;
            id = PREFIX + "%03d".formatted(candidate);
        } while (mappingRepository.findById(id).isPresent());
        return id;
    }

    private int highestInUse() {
        int highest = 0;
        for (SemanticMapping mapping : mappingRepository.findAll()) {
            Matcher matcher = NUMBERED.matcher(mapping.id());
            if (matcher.matches()) {
                highest = Math.max(highest, Integer.parseInt(matcher.group(1)));
            }
        }
        return highest;
    }
}
