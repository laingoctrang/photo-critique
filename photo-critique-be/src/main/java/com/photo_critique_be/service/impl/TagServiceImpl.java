package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.request.tag.TagRequest;
import com.photo_critique_be.dto.response.tag.TagResponse;
import com.photo_critique_be.exception.ConflictException;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.model.Tag;
import com.photo_critique_be.repository.TagRepository;
import com.photo_critique_be.service.TagService;
import com.photo_critique_be.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    private TagResponse toResponse(Tag t) {
        TagResponse r = new TagResponse();
        r.setId(t.getId());
        r.setName(t.getName());
        r.setSlug(t.getSlug());
        r.setDescription(t.getDescription());
        r.setPostCount(t.getPostCount());
        return r;
    }

    @Override
    @Transactional
    public TagResponse createTag(TagRequest request) {
        String name = request.getName().trim();
        if (tagRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Tag name already exists");
        }

        String slug = SlugUtil.toSlug(name);
        if (tagRepository.existsBySlug(slug)) {
            // append suffix to make unique (simple strategy)
            int i = 2;
            String base = slug;
            while (tagRepository.existsBySlug(slug)) {
                slug = base + "-" + i++;
            }
        }

        Tag tag = new Tag();
        tag.setName(name);
        tag.setSlug(slug);
        tag.setDescription(request.getDescription());
        tag.setPostCount(0L);

        Tag saved = tagRepository.save(tag);
        return toResponse(saved);
    }

    @Override
    public TagResponse getById(String id) {
        Tag t = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
        return toResponse(t);
    }

    @Override
    public TagResponse getBySlug(String slug) {
        Tag t = tagRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with slug: " + slug));
        return toResponse(t);
    }

    @Override
    public Page<TagResponse> listTags(Pageable pageable) {
        Page<Tag> page = tagRepository.findAll(pageable);
        List<TagResponse> content = page.stream().map(this::toResponse).collect(Collectors.toList());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Override
    public Page<TagResponse> searchTags(String q, Pageable pageable) {
        if (q == null || q.trim().isEmpty()) {
            return listTags(pageable);
        }
        // build case-insensitive regex
        String regex = String.format("(?i).*%s.*", q.trim());
        Page<Tag> page = tagRepository.findByNameRegex(regex, pageable);
        List<TagResponse> content = page.stream().map(this::toResponse).collect(Collectors.toList());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Override
    public List<TagResponse> getTrendingTags(int limit) {
        List<Tag> list = tagRepository.findTop10ByOrderByPostCountDesc();
        if (limit > 0 && list.size() > limit) {
            list = list.subList(0, limit);
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TagResponse updateTag(String id, TagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));

        String newName = request.getName().trim();
        if (!tag.getName().equalsIgnoreCase(newName) && tagRepository.existsByNameIgnoreCase(newName)) {
            throw new ConflictException("Another tag with same name exists");
        }

        tag.setName(newName);
        tag.setDescription(request.getDescription());

        // update slug if name changed
        String newSlug = SlugUtil.toSlug(newName);
        if (!newSlug.equals(tag.getSlug())) {
            String base = newSlug;
            int i = 2;
            while (tagRepository.existsBySlug(newSlug)) {
                newSlug = base + "-" + i++;
            }
            tag.setSlug(newSlug);
        }

        Tag saved = tagRepository.save(tag);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteTag(String id) {
        Tag t = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
        tagRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void incrementPostCount(String tagId, long delta) {
        Tag t = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + tagId));
        t.setPostCount(Math.max(0L, t.getPostCount() + delta));
        tagRepository.save(t);
    }
}

