package com.photo_critique_be.dto.response.ranking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostRankingResponse {
    private String postId;
    private String userId;
    private String username;
    private String caption;
    private List<String> imageUrls;
    private Integer reactionsCount;
    private Integer commentsCount;
    private Integer rank;
}

