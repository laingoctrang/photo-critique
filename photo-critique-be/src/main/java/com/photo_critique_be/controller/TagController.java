package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.tag.TagRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.tag.TagResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final LanguageService languageService;

    /**
     * Create new tag
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TagResponse>> createTag(@Valid @RequestBody TagRequest request) {
        TagResponse created = tagService.createTag(request);
        return ResponseEntity.ok(ApiResponse.created(created, languageService.getMessage(MessageCode.TAG_CREATED_SUCCESS)));
    }

    /**
     * Get tag by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TagResponse>> getById(@PathVariable("id") String id) {
        TagResponse response = tagService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.TAG_GET_SUCCESS)));
    }

    /**
     * Get tag by slug
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<TagResponse>> getBySlug(@PathVariable("slug") String slug) {
        TagResponse response = tagService.getBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.TAG_GET_SUCCESS)));
    }

    /**
     * List tags with pagination (page, size)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TagResponse>>> listTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<TagResponse> response = tagService.listTags(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.TAG_LIST_SUCCESS)));
    }

    /**
     * Search tags by name (q param)
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<TagResponse>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<TagResponse> response = tagService.searchTags(q, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.TAG_SEARCH_SUCCESS)));
    }

    /**
     * Trending tags
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<TagResponse>>> trending(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<TagResponse> response = tagService.getTrendingTags(limit);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.TAG_TRENDING_SUCCESS)));
    }

    /**
     * Update tag
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TagResponse>> updateTag(
            @PathVariable("id") String id,
            @Valid @RequestBody TagRequest request) {
        TagResponse response = tagService.updateTag(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.TAG_UPDATED_SUCCESS)));
    }

    /**
     * Delete tag
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable("id") String id) {
        tagService.deleteTag(id);
        return ResponseEntity.ok(ApiResponse.success(null, languageService.getMessage(MessageCode.TAG_DELETED_SUCCESS)));
    }
}
