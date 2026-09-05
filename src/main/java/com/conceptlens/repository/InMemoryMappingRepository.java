package com.conceptlens.repository;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.conceptlens.model.SemanticMapping;

/**
 * Holds the semantic mappings in memory, keyed by mapping id.
 *
 * <p>This is the one part of the model the application may change, so the map is mutable and
 * guarded for concurrent use. Insertion order is preserved, which keeps the seeded mappings in
 * file order and appends anything created at runtime.
 *
 * <p>Nothing here touches {@code demo/mappings.json}: runtime changes live only for as long as
 * the application does.
 */
@Repository
public class InMemoryMappingRepository implements MappingRepository {

    private final Map<String, SemanticMapping> mappingsById =
            Collections.synchronizedMap(new LinkedHashMap<>());

    @Override
    public List<SemanticMapping> findAll() {
        synchronized (mappingsById) {
            return List.copyOf(mappingsById.values());
        }
    }

    @Override
    public Optional<SemanticMapping> findById(String id) {
        return Optional.ofNullable(mappingsById.get(id));
    }

    @Override
    public SemanticMapping create(SemanticMapping mapping) {
        SemanticMapping existing = mappingsById.putIfAbsent(mapping.id(), mapping);
        if (existing != null) {
            throw new IllegalArgumentException("Mapping already exists: " + mapping.id());
        }
        return mapping;
    }

    @Override
    public boolean deleteById(String id) {
        return mappingsById.remove(id) != null;
    }
}
