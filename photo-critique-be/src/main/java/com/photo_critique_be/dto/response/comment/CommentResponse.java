package com.photo_critique_be.dto.response.comment;

import com.photo_critique_be.dto.response.user.UserListItemResponse;
import com.photo_critique_be.dto.response.user.UserPostResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentResponse {
    private String id;
    private String postId;
    private UserPostResponse user;
    private String content;
    private String aiGeneratedImage;
    private String originalImage;
    private String parentCommentId;
    private Boolean isHelpful;
    private Integer likesCount;
    private Boolean isLiked;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

