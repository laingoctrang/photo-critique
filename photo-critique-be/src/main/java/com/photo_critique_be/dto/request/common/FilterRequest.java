package com.photo_critique_be.dto.request.common;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterRequest {
    private String search;
    private Map<String, String> filters;
    private String sortBy;
    private String sortDirection; // "asc" or "desc"
    
    @Min(0)
    private Integer page = 0;
    
    @Min(1)
    private Integer size = 20;
}

