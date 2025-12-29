package com.photo_critique_be.dto.request.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResolveReportRequest {
    
    @NotBlank(message = "Resolution is required")
    @Size(min = 10, max = 500, message = "Resolution must be between 10 and 500 characters")
    private String resolution;
    
    private String action; // "DELETE", "WARN", "NO_ACTION", etc.
}






