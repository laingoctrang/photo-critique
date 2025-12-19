package com.photo_critique_be.mapper;

import com.photo_critique_be.dto.response.xp.XPEventResponse;
import com.photo_critique_be.model.XPEvent;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface XPEventMapper {
    XPEventResponse toResponse(XPEvent xpEvent);
}

