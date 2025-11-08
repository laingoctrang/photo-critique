package com.photo_critique_be.mapper;

import com.photo_critique_be.dto.response.UserInfoResponse;
import com.photo_critique_be.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.springframework.web.bind.annotation.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserInfoResponse toResponse(User user);

}
