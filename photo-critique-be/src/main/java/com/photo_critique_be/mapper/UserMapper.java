package com.photo_critique_be.mapper;

import com.photo_critique_be.dto.FollowInfo;
import com.photo_critique_be.dto.response.user.UserInfoResponse;
import com.photo_critique_be.dto.response.user.UserListItemResponse;
import com.photo_critique_be.dto.response.user.UserProfileResponse;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {BadgeMapper.class})
public interface UserMapper {

    UserInfoResponse toResponse(User user);

    @Mapping(source = "followInfo.isFollowing", target = "isFollowing")
    @Mapping(source = "followInfo.isFollowedBy", target = "isFollowedBy")
    @Mapping(source = "followInfo.followStatus", target = "followStatus")
    UserProfileResponse toUserProfileResponse(User user, FollowInfo followInfo);

    @Mapping(source = "followInfo.isFollowing", target = "isFollowing")
    @Mapping(source = "followInfo.isFollowedBy", target = "isFollowedBy")
    @Mapping(source = "followInfo.followStatus", target = "followStatus")
    UserListItemResponse toUserListItemResponse(User user, FollowInfo followInfo);
}
