package com.photo_critique_be.dto.response.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityStatistics {
    private Long postsToday;
    private Long postsThisWeek;
    private Long postsThisMonth;
    private Long usersToday;
    private Long usersThisWeek;
    private Long usersThisMonth;
    private Long commentsToday;
    private Long reactionsToday;
}

