package com.photo_critique_be.dto.response.ranking;

import com.photo_critique_be.enums.RankingPeriod;
import com.photo_critique_be.enums.RankingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingResponse {
    private RankingType type;
    private RankingPeriod period;
    private LocalDate snapshotDate;
    private List<UserRankingResponse> userRankings;
    private List<PostRankingResponse> postRankings;
    private Integer totalCount;
}

