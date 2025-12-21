package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.request.badge.BadgeRequest;
import com.photo_critique_be.dto.request.common.FilterRequest;
import com.photo_critique_be.dto.response.badge.BadgeEarnedResponse;
import com.photo_critique_be.dto.response.badge.BadgeResponse;
import com.photo_critique_be.dto.response.common.PageResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.mapper.BadgeMapper;
import com.photo_critique_be.model.Badge;
import com.photo_critique_be.model.embedded.BadgeEarned;
import com.photo_critique_be.repository.BadgeRepository;
import com.photo_critique_be.service.BadgeService;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.util.FilterUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeServiceImpl implements BadgeService {

    private final BadgeRepository badgeRepository;
    private final BadgeMapper badgeMapper;
    private final LanguageService languageService;
    private final MongoTemplate mongoTemplate;

    @Override
    public BadgeEarnedResponse getBadgeEarned(BadgeEarned badgeEarned) {
        Badge badge = badgeRepository.findById(badgeEarned.getBadgeId())
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.BADGE_NOT_FOUND)));
        return badgeMapper.toBadgeEarnedResponse(badge, badgeEarned);
    }

    @Override
    public List<BadgeEarnedResponse> getBadgesEarned(List<BadgeEarned> badgesEarned) {
        List<String> ids = badgesEarned.stream()
                .map(BadgeEarned::getBadgeId)
                .toList();
        List<Badge> badges = badgeRepository.findAllById(ids);
        if (badges.isEmpty()) {
            throw new ResourceNotFoundException(languageService.getMessage(MessageCode.BADGE_NOT_FOUND));
        }

        List<BadgeEarnedResponse> badgesEarnedResponse = badges.stream()
                .map(badge -> {
                    BadgeEarned badgeEarned = badgesEarned.stream()
                            .filter(be -> be.getBadgeId().equals(badge.getId()))
                            .findFirst()
                            .orElse(null);
                    return badgeMapper.toBadgeEarnedResponse(badge, badgeEarned);
                })
                .toList();

        return badgesEarnedResponse;
    }

    @Override
    public List<BadgeResponse> getAllBadges() {
        log.debug("Fetching all badges");
        return badgeRepository.findAll().stream()
                .map(badgeMapper::toResponse)
                .toList();
    }

    @Override
    public PageResponse<BadgeResponse> getBadgesFiltered(FilterRequest filterRequest) {
        log.debug("Fetching badges with filters: {}", filterRequest);
        
        // Build pageable
        Pageable pageable = FilterUtil.buildPageable(
            filterRequest.getPage(),
            filterRequest.getSize(),
            filterRequest.getSortBy() != null ? convertFieldName(filterRequest.getSortBy()) : null,
            filterRequest.getSortDirection()
        );

        // Build criteria
        Criteria searchCriteria = FilterUtil.buildSearchCriteria(
            filterRequest.getSearch(),
            "name", "description"
        );
        Criteria filterCriteria = FilterUtil.buildFilterCriteria(filterRequest.getFilters());
        Criteria combinedCriteria = FilterUtil.combineCriteria(searchCriteria, filterCriteria);

        // Build query
        Query query = new Query(combinedCriteria).with(pageable);

        // Get total count
        long totalElements = mongoTemplate.count(query, Badge.class);

        // Get data
        List<Badge> badges = mongoTemplate.find(query, Badge.class);
        List<BadgeResponse> content = badges.stream()
                .map(badgeMapper::toResponse)
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());

        return PageResponse.<BadgeResponse>builder()
                .content(content)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(pageable.getPageNumber() < totalPages - 1)
                .hasPrevious(pageable.getPageNumber() > 0)
                .build();
    }

    private String convertFieldName(String fieldName) {
        // Convert camelCase to snake_case for MongoDB field names
        return switch (fieldName) {
            case "xpThreshold" -> "xp_threshold";
            case "iconUrl" -> "icon_url";
            case "createdAt" -> "created_at";
            case "updatedAt" -> "updated_at";
            default -> fieldName.toLowerCase();
        };
    }

    @Override
    public BadgeResponse getBadgeById(String id) {
        log.debug("Fetching badge with id: {}", id);
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.BADGE_NOT_FOUND)));
        return badgeMapper.toResponse(badge);
    }

    @Override
    public BadgeResponse createBadge(BadgeRequest request) {
        log.info("Creating badge: {}", request.getName());
        
        if (badgeRepository.existsByName(request.getName())) {
            throw new ResourceNotFoundException("Badge with name already exists");
        }

        Badge badge = new Badge();
        badge.setName(request.getName());
        badge.setDescription(request.getDescription());
        badge.setIconUrl(request.getIconUrl());
        badge.setXpThreshold(request.getXpThreshold());
        badge.setLevel(request.getLevel());

        Badge saved = badgeRepository.save(badge);
        log.info("Badge created with id: {}", saved.getId());
        return badgeMapper.toResponse(saved);
    }

    @Override
    public BadgeResponse updateBadge(String id, BadgeRequest request) {
        log.info("Updating badge with id: {}", id);
        
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.BADGE_NOT_FOUND)));

        if (badgeRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new ResourceNotFoundException("Badge with name already exists");
        }

        badge.setName(request.getName());
        badge.setDescription(request.getDescription());
        badge.setIconUrl(request.getIconUrl());
        badge.setXpThreshold(request.getXpThreshold());
        badge.setLevel(request.getLevel());

        Badge saved = badgeRepository.save(badge);
        log.info("Badge updated: {}", saved.getId());
        return badgeMapper.toResponse(saved);
    }

    @Override
    public void deleteBadge(String id) {
        log.info("Deleting badge with id: {}", id);
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.BADGE_NOT_FOUND)));
        badgeRepository.delete(badge);
        log.info("Badge deleted: {}", id);
    }
}
