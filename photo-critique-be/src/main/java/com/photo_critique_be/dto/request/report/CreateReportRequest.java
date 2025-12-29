package com.photo_critique_be.dto.request.report;

import com.photo_critique_be.enums.ReportContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateReportRequest {
    
    @NotNull(message = "Content type is required")
    private ReportContentType contentType;
    
    @NotBlank(message = "Reported content ID is required")
    private String reportedContentId;
    
    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
    private String reason;
}






