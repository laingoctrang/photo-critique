package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.report.CreateReportRequest;
import com.photo_critique_be.dto.request.report.ResolveReportRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.report.ReportResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.ReportContentType;
import com.photo_critique_be.enums.ReportStatus;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final LanguageService languageService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @Valid @RequestBody CreateReportRequest request) {
        ReportResponse response = reportService.createReport(request);
        return ResponseEntity.ok(ApiResponse.created(response, languageService.getMessage(MessageCode.REPORT_CREATED_SUCCESS)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportContentType contentType,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ReportResponse> response = reportService.getReports(status, contentType, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.REPORT_LIST_SUCCESS)));
    }

    @GetMapping("/{reportId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<ReportResponse>> getReportById(@PathVariable String reportId) {
        ReportResponse response = reportService.getReportById(reportId);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.REPORT_GET_SUCCESS)));
    }

    @PostMapping("/{reportId}/resolve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(
            @PathVariable String reportId,
            @Valid @RequestBody ResolveReportRequest request) {
        ReportResponse response = reportService.resolveReport(reportId, request);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.REPORT_RESOLVED_SUCCESS)));
    }

    @PostMapping("/{reportId}/dismiss")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<ReportResponse>> dismissReport(@PathVariable String reportId) {
        ReportResponse response = reportService.dismissReport(reportId);
        return ResponseEntity.ok(ApiResponse.success(response, languageService.getMessage(MessageCode.REPORT_DISMISSED_SUCCESS)));
    }
}






