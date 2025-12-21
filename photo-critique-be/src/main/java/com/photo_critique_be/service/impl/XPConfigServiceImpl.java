package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.request.common.FilterRequest;
import com.photo_critique_be.dto.request.xp.XPConfigRequest;
import com.photo_critique_be.dto.response.common.PageResponse;
import com.photo_critique_be.dto.response.xp.XPConfigResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.XPConfigStatus;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.mapper.XPConfigMapper;
import com.photo_critique_be.model.XPConfig;
import com.photo_critique_be.repository.XPConfigRepository;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.XPConfigService;
import com.photo_critique_be.util.FilterUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class XPConfigServiceImpl implements XPConfigService {

    private final XPConfigRepository xpConfigRepository;
    private final XPConfigMapper xpConfigMapper;
    private final LanguageService languageService;
    private final MongoTemplate mongoTemplate;

    @Cacheable(value = "xpConfig", key = "#eventType")
        public XPConfig getConfig(String eventType) {
            log.debug("Fetching XP config for event type: {}", eventType);
            return xpConfigRepository.findByEventTypeAndStatus(eventType, XPConfigStatus.ACTIVE)
                    .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.XP_CONFIG_NOT_FOUND)));
        }

        @Cacheable(value = "allXPConfigs")
        public Map<String, XPConfig> getAllConfigs() {
            log.debug("Fetching all XP configs");
            return xpConfigRepository.findAllByStatus(XPConfigStatus.ACTIVE).stream()
                    .collect(Collectors.toMap(XPConfig::getEventType, config -> config));
        }

        public List<XPConfigResponse> getAllConfigsResponse() {
            return xpConfigRepository.findAllByStatus(XPConfigStatus.ACTIVE).stream()
                    .map(xpConfigMapper::toResponse)
                    .collect(Collectors.toList());
        }

        @Override
        public PageResponse<XPConfigResponse> getConfigsFiltered(FilterRequest filterRequest) {
            log.debug("Fetching XP configs with filters: {}", filterRequest);
            
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
                "event_type", "name", "description", "category"
            );
            Criteria filterCriteria = FilterUtil.buildFilterCriteria(filterRequest.getFilters());
            // No default filter - allow all statuses in filtered view
            Criteria combinedCriteria = FilterUtil.combineCriteria(searchCriteria, filterCriteria);

            // Build query
            Query query = new Query(combinedCriteria).with(pageable);

            // Get total count
            long totalElements = mongoTemplate.count(query, XPConfig.class);

            // Get data
            List<XPConfig> configs = mongoTemplate.find(query, XPConfig.class);
            List<XPConfigResponse> content = configs.stream()
                    .map(xpConfigMapper::toResponse)
                    .collect(Collectors.toList());

            int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());

            return PageResponse.<XPConfigResponse>builder()
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
            return switch (fieldName) {
                case "eventType" -> "event_type";
                case "isActive" -> "is_active";
                case "status" -> "status";
                case "createdAt" -> "created_at";
                case "updatedAt" -> "updated_at";
                default -> fieldName.toLowerCase();
            };
        }

        /**
         * Convert name to event_type format: UPPERCASE with underscores
         * Example: "Create Post" -> "CREATE_POST"
         */
        private String generateEventTypeFromName(String name) {
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalArgumentException("Name cannot be empty");
            }
            return name.trim()
                    .toUpperCase()
                    .replaceAll("[^A-Z0-9]", "_")
                    .replaceAll("_+", "_")
                    .replaceAll("^_|_$", "");
        }

        @CacheEvict(value = {"xpConfig", "allXPConfigs"}, allEntries = true)
        public XPConfigResponse createOrUpdateConfig(XPConfigRequest request) {
            // Generate event_type from name if not provided or if creating new
            String eventType = request.getEventType();
            if (eventType == null || eventType.trim().isEmpty()) {
                eventType = generateEventTypeFromName(request.getName());
                request.setEventType(eventType);
            }

            log.info("Creating/Updating XP config for event type: {}", eventType);

            XPConfig config = xpConfigRepository.findByEventType(eventType)
                    .map(existing -> updateExistingConfig(existing, request))
                    .orElseGet(() -> createNewConfig(request));

            XPConfig saved = xpConfigRepository.save(config);
            log.info("XP config saved: {}", saved.getEventType());

            return xpConfigMapper.toResponse(saved);
        }

        @CacheEvict(value = {"xpConfig", "allXPConfigs"}, allEntries = true)
        public XPConfigResponse updatePoints(String eventType, Integer points) {
            log.info("Updating points for event type: {} to {}", eventType, points);

            XPConfig config = xpConfigRepository.findByEventType(eventType)
                    .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.XP_CONFIG_NOT_FOUND)));

            config.setPoints(points);

            XPConfig saved = xpConfigRepository.save(config);
            return xpConfigMapper.toResponse(saved);
        }

        @CacheEvict(value = {"xpConfig", "allXPConfigs"}, allEntries = true)
        public void deleteConfig(String eventType) {
            log.info("Deleting XP config for event type: {}", eventType);

            XPConfig config = xpConfigRepository.findByEventType(eventType)
                    .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.XP_CONFIG_NOT_FOUND)));

            // Set status to PENDING_DEVELOPMENT instead of deleting
            config.setStatus(XPConfigStatus.PENDING_DEVELOPMENT);
            xpConfigRepository.save(config);
        }

        private XPConfig createNewConfig(XPConfigRequest request) {
            // Default status to PENDING_DEVELOPMENT for new configs
            XPConfigStatus status = request.getStatus() != null 
                    ? request.getStatus() 
                    : XPConfigStatus.PENDING_DEVELOPMENT;

            return XPConfig.builder()
                    .eventType(request.getEventType())
                    .name(request.getName())
                    .points(request.getPoints())
                    .description(request.getDescription())
                    .category(request.getCategory())
                    .status(status)
                    .version(1)
                    .build();
        }

        private XPConfig updateExistingConfig(XPConfig existing, XPConfigRequest request) {
            existing.setName(request.getName());
            existing.setPoints(request.getPoints());
            existing.setDescription(request.getDescription());
            existing.setCategory(request.getCategory());
            if (request.getStatus() != null) {
                existing.setStatus(request.getStatus());
            }
            existing.setVersion(existing.getVersion() + 1);
            return existing;
        }

}
