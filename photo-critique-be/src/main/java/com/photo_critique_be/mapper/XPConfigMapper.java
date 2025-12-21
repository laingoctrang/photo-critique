package com.photo_critique_be.mapper;

import com.photo_critique_be.dto.response.xp.XPConfigResponse;
import com.photo_critique_be.model.XPConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface XPConfigMapper {
    @Mapping(target = "isActive", expression = "java(config.getStatus() != null && config.getStatus() == com.photo_critique_be.enums.XPConfigStatus.ACTIVE)")
    XPConfigResponse toResponse(XPConfig config);
}
