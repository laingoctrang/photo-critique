package com.photo_critique_be.dto.response.post;

import com.photo_critique_be.dto.ReactionInfo;
import com.photo_critique_be.dto.response.user.UserPostResponse;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.enums.ReactionType;
import com.photo_critique_be.model.embedded.ImageInfo;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private String id;
    private UserPostResponse user;
    private String caption;
    private List<ImageInfo> imageUrls;
    private PrivacyType privacy;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer sharesCount;
    private List<ReactionInfo> reactions;
    private List<String> tags;
    private Boolean isLiked;
    private ReactionType userReaction;
    private Boolean isSaved;
    private Boolean isShared;
    private String originalPostId;
    private UserPostResponse originalPostAuthor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

