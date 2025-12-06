package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.xp.XPConfigRequest;
import com.photo_critique_be.dto.response.xp.XPConfigResponse;
import com.photo_critique_be.model.XPConfig;

import java.util.List;
import java.util.Map;

public interface XPConfigService {
    XPConfig getConfig(String eventType);
    Map<String, XPConfig> getAllConfigs();
    List<XPConfigResponse> getAllConfigsResponse();
    XPConfigResponse createOrUpdateConfig(XPConfigRequest request);
    XPConfigResponse updatePoints(String eventType, Integer points);
    void deleteConfig(String eventType);
}
