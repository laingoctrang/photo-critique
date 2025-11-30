package com.photo_critique_be.mapper;


import com.photo_critique_be.dto.response.badge.BadgeResponse;
import com.photo_critique_be.dto.response.badge.BadgeEarnedResponse;
import com.photo_critique_be.model.Badge;
import com.photo_critique_be.model.embedded.BadgeEarned;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BadgeMapper {

    BadgeResponse toResponse(Badge badge);

    @Mapping(source = "badgeEarned.earnedAt", target = "earnedAt")
    BadgeEarnedResponse toBadgeEarnedResponse(Badge badge, BadgeEarned badgeEarned);
}
