package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.report.CreateReportRequest;
import com.photo_critique_be.dto.request.report.ResolveReportRequest;
import com.photo_critique_be.dto.response.report.ReportResponse;
import com.photo_critique_be.enums.ReportContentType;
import com.photo_critique_be.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {
    ReportResponse createReport(CreateReportRequest request);
    Page<ReportResponse> getReports(ReportStatus status, ReportContentType contentType, Pageable pageable);
    ReportResponse getReportById(String reportId);
    ReportResponse resolveReport(String reportId, ResolveReportRequest request);
    ReportResponse dismissReport(String reportId);
}






