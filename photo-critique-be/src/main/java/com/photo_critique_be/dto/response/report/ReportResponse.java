package com.photo_critique_be.dto.response.report;

import com.photo_critique_be.dto.response.user.UserPostResponse;
import com.photo_critique_be.enums.ReportContentType;
import com.photo_critique_be.enums.ReportStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {
    private String id;
    private UserPostResponse reporter;
    private ReportContentType contentType;
    private String reportedContentId;
    private UserPostResponse reportedUser;
    private String reason;
    private ReportStatus status;
    private LocalDateTime resolvedAt;
    private UserPostResponse resolvedByUser;
    private String resolution;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional info for display
    private String reportedContentPreview; // Caption or comment content preview
}






