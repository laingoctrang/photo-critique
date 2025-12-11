package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.tag.TagRequest;
import com.photo_critique_be.dto.response.tag.TagResponse;
import com.photo_critique_be.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    /**
     * Create new tag
     */
    @PostMapping
    public ResponseEntity<TagResponse> createTag(@Validated @RequestBody TagRequest request) {
        TagResponse created = tagService.createTag(request);
        return ResponseEntity.created(URI.create("/api/tags/" + created.getId())).body(created);
    }

    /**
     * Get tag by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(tagService.getById(id));
    }

    /**
     * Get tag by slug
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<TagResponse> getBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(tagService.getBySlug(slug));
    }

    /**
     * List tags with pagination (page, size)
     */
    @GetMapping
    public ResponseEntity<Page<TagResponse>> listTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<TagResponse> p = tagService.listTags(PageRequest.of(page, size));
        return ResponseEntity.ok(p);
    }

    /**
     * Search tags by name (q param)
     */
    @GetMapping("/search")
    public ResponseEntity<Page<TagResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<TagResponse> p = tagService.searchTags(q, PageRequest.of(page, size));
        return ResponseEntity.ok(p);
    }

    /**
     * Trending tags
     */
    @GetMapping("/trending")
    public ResponseEntity<List<TagResponse>> trending(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(tagService.getTrendingTags(limit));
    }

    /**
     * Update tag
     */
    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> updateTag(@PathVariable("id") String id,
                                                 @Validated @RequestBody TagRequest request) {
        return ResponseEntity.ok(tagService.updateTag(id, request));
    }

    /**
     * Delete tag
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable("id") String id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
