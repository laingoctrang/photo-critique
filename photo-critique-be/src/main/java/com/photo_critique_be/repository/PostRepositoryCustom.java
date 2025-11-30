package com.photo_critique_be.repository;

import com.photo_critique_be.dto.response.post.PostListItemResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostRepositoryCustom {
    List<PostListItemResponse> findFeedWithAggregation(
            String currentUserId,
            List<String> userIds,          // current + followings
            List<String> privacyValues,    // e.g. ["PUBLIC","FOLLOWER_ONLY"]
            Pageable pageable
    );
}