package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.request.xp.XPConfigRequest;
import com.photo_critique_be.dto.response.xp.XPConfigResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.mapper.XPConfigMapper;
import com.photo_critique_be.model.XPConfig;
import com.photo_critique_be.repository.XPConfigRepository;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.XPConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    @Cacheable(value = "xpConfig", key = "#eventType")
        public XPConfig getConfig(String eventType) {
            log.debug("Fetching XP config for event type: {}", eventType);
            return xpConfigRepository.findByEventTypeAndIsActiveTrue(eventType)
                    .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.XP_CONFIG_NOT_FOUND)));
        }

        @Cacheable(value = "allXPConfigs")
        public Map<String, XPConfig> getAllConfigs() {
            log.debug("Fetching all XP configs");
            return xpConfigRepository.findAllByIsActiveTrue().stream()
                    .collect(Collectors.toMap(XPConfig::getEventType, config -> config));
        }

        public List<XPConfigResponse> getAllConfigsResponse() {
            return xpConfigRepository.findAllByIsActiveTrue().stream()
                    .map(xpConfigMapper::toResponse)
                    .collect(Collectors.toList());
        }

        @CacheEvict(value = {"xpConfig", "allXPConfigs"}, allEntries = true)
        public XPConfigResponse createOrUpdateConfig(XPConfigRequest request) {
            log.info("Creating/Updating XP config for event type: {}", request.getEventType());

            XPConfig config = xpConfigRepository.findByEventType(request.getEventType())
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

            config.setIsActive(false);
            xpConfigRepository.save(config);
        }

        private XPConfig createNewConfig(XPConfigRequest request) {
            return XPConfig.builder()
                    .eventType(request.getEventType())
                    .name(request.getName())
                    .points(request.getPoints())
                    .description(request.getDescription())
                    .category(request.getCategory())
                    .isActive(true)
                    .version(1)
                    .build();
        }

        private XPConfig updateExistingConfig(XPConfig existing, XPConfigRequest request) {
            existing.setName(request.getName());
            existing.setPoints(request.getPoints());
            existing.setDescription(request.getDescription());
            existing.setCategory(request.getCategory());
            existing.setVersion(existing.getVersion() + 1);
            return existing;
        }

}
