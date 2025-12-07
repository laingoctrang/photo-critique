package com.photo_critique_be.mapper;

import com.photo_critique_be.dto.response.post.PostListItemResponse;
import com.photo_critique_be.dto.response.post.PostResponse;
import com.photo_critique_be.model.Post;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostMapper {
    PostResponse toPostResponse(Post post);
    PostListItemResponse toPostListItemResponse(Post post);
}
