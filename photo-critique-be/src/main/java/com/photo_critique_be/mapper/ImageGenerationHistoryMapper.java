package com.photo_critique_be.mapper;

import com.photo_critique_be.dto.response.imagegeneration.ImageGenerationHistoryResponse;
import com.photo_critique_be.model.ImageGenerationHistory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ImageGenerationHistoryMapper {
    ImageGenerationHistoryResponse toResponse(ImageGenerationHistory history);
}