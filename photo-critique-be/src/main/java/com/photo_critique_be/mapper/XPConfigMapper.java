package com.photo_critique_be.mapper;

import com.photo_critique_be.dto.response.xp.XPConfigResponse;
import com.photo_critique_be.model.XPConfig;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface XPConfigMapper {
    XPConfigResponse toResponse(XPConfig config);
}
