package com.conceptlens.api;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.conceptlens.model.SemanticMapping;
import com.conceptlens.service.MappingDraft;
import com.conceptlens.service.MappingService;

/**
 * Reads and maintains the semantic mappings Concept Lens owns.
 *
 * <p>Mappings are the one part of the model callers may change. Changes apply to runtime state
 * only and are lost on restart.
 */
@RestController
@RequestMapping("/api/mappings")
public class MappingController {

    private final MappingService mappingService;

    public MappingController(MappingService mappingService) {
        this.mappingService = mappingService;
    }

    @GetMapping
    public List<SemanticMapping> getAllMappings() {
        return mappingService.getAllMappings();
    }

    @GetMapping("/{id}")
    public SemanticMapping getMapping(@PathVariable String id) {
        return mappingService.getMapping(id);
    }

    /**
     * Creates a mapping from a draft, which carries no id: Concept Lens assigns one. The created
     * mapping, including its generated id, is returned.
     */
    @PostMapping
    public ResponseEntity<SemanticMapping> addMapping(@RequestBody MappingDraft draft) {
        SemanticMapping created = mappingService.addMapping(draft);
        return ResponseEntity.created(URI.create("/api/mappings/" + created.id())).body(created);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMapping(@PathVariable String id) {
        mappingService.removeMapping(id);
    }
}
