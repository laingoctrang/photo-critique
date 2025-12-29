package com.photo_critique_be.repository;

import com.photo_critique_be.enums.ReportContentType;
import com.photo_critique_be.enums.ReportStatus;
import com.photo_critique_be.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    
    Page<Report> findByContentType(ReportContentType contentType, Pageable pageable);
    
    Page<Report> findByStatusAndContentType(ReportStatus status, ReportContentType contentType, Pageable pageable);
    
    @Query("{'reported_content_id': ?0, 'content_type': ?1, 'status': {$in: ['PENDING', 'REVIEWING']}}")
    Optional<Report> findActiveReportByContent(String contentId, ReportContentType contentType);
    
    @Query("{'reporter_id': ?0, 'reported_content_id': ?1, 'content_type': ?2}")
    Optional<Report> findByReporterAndContent(String reporterId, String contentId, ReportContentType contentType);
    
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);
}






