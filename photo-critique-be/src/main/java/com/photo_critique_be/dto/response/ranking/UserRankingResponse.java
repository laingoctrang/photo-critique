package com.photo_critique_be.dto.response.ranking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRankingResponse {
    private String userId;
    private String username;
    private String profilePicture;
    private Integer xpPoints;
    private Integer level;
    private Integer rank;
}

