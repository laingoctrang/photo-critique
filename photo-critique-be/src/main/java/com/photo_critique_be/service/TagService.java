package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.tag.TagRequest;
import com.photo_critique_be.dto.response.tag.TagResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TagService {
    TagResponse createTag(TagRequest request);
    TagResponse getById(String id);
    TagResponse getBySlug(String slug);
    Page<TagResponse> listTags(Pageable pageable);
    Page<TagResponse> searchTags(String q, Pageable pageable);
    List<TagResponse> getTrendingTags(int limit);
    TagResponse updateTag(String id, TagRequest request);
    void deleteTag(String id);

    // utility for posts service to update counts
    void incrementPostCount(String tagId, long delta);
}
