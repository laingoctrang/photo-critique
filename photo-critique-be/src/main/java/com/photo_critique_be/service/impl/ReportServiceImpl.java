package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.FollowInfo;
import com.photo_critique_be.dto.request.report.CreateReportRequest;
import com.photo_critique_be.dto.request.report.ResolveReportRequest;
import com.photo_critique_be.dto.response.report.ReportResponse;
import com.photo_critique_be.dto.response.user.UserPostResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.PostStatus;
import com.photo_critique_be.enums.ReportContentType;
import com.photo_critique_be.enums.ReportStatus;
import com.photo_critique_be.exception.BusinessException;
import com.photo_critique_be.exception.ConflictException;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.mapper.UserMapper;
import com.photo_critique_be.model.Comment;
import com.photo_critique_be.model.Post;
import com.photo_critique_be.model.Report;
import com.photo_critique_be.model.User;
import com.photo_critique_be.repository.CommentRepository;
import com.photo_critique_be.repository.PostRepository;
import com.photo_critique_be.repository.ReportRepository;
import com.photo_critique_be.repository.UserRepository;
import com.photo_critique_be.service.FollowService;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.PostService;
import com.photo_critique_be.service.ReportService;
import com.photo_critique_be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final FollowService followService;
    private final LanguageService languageService;
    private final PostService postService;

    @Override
    @Transactional
    public ReportResponse createReport(CreateReportRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        
        // Check if user already reported this content
        reportRepository.findByReporterAndContent(currentUserId, request.getReportedContentId(), request.getContentType())
                .ifPresent(report -> {
                    throw new ConflictException(languageService.getMessage(MessageCode.REPORT_ALREADY_EXISTS));
                });

        // Validate content exists and get reported user
        String reportedUserId = null;
        String contentPreview = null;
        
        if (request.getContentType() == ReportContentType.POST) {
            Post post = postRepository.findById(request.getReportedContentId())
                    .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.POST_NOT_FOUND)));
            
            // Can't report own post
            if (post.getUserId().equals(currentUserId)) {
                throw new BusinessException(languageService.getMessage(MessageCode.REPORT_CANNOT_REPORT_OWN_CONTENT));
            }
            
            reportedUserId = post.getUserId();
            contentPreview = post.getCaption() != null && !post.getCaption().isEmpty() 
                    ? post.getCaption() 
                    : "Post with " + (post.getImageUrls() != null ? post.getImageUrls().size() : 0) + " image(s)";
            
            // Update post status to REPORTED if not already
            if (post.getStatus() != PostStatus.REPORTED) {
                post.setStatus(PostStatus.REPORTED);
                postRepository.save(post);
            }
        } else if (request.getContentType() == ReportContentType.COMMENT) {
            Comment comment = commentRepository.findById(request.getReportedContentId())
                    .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.COMMENT_NOT_FOUND)));
            
            // Can't report own comment
            if (comment.getUserId().equals(currentUserId)) {
                throw new BusinessException(languageService.getMessage(MessageCode.REPORT_CANNOT_REPORT_OWN_CONTENT));
            }
            
            reportedUserId = comment.getUserId();
            contentPreview = comment.getContent() != null && !comment.getContent().isEmpty()
                    ? comment.getContent()
                    : "Comment";
        }

        // Create report
        Report report = new Report();
        report.setReporterId(currentUserId);
        report.setContentType(request.getContentType());
        report.setReportedContentId(request.getReportedContentId());
        report.setReportedUserId(reportedUserId);
        report.setReason(request.getReason());
        report.setStatus(ReportStatus.PENDING);
        
        report = reportRepository.save(report);
        
        return buildReportResponse(report, contentPreview);
    }

    @Override
    public Page<ReportResponse> getReports(ReportStatus status, ReportContentType contentType, Pageable pageable) {
        Page<Report> reports;
        
        if (status != null && contentType != null) {
            reports = reportRepository.findByStatusAndContentType(status, contentType, pageable);
        } else if (status != null) {
            reports = reportRepository.findByStatus(status, pageable);
        } else if (contentType != null) {
            reports = reportRepository.findByContentType(contentType, pageable);
        } else {
            reports = reportRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        
        List<ReportResponse> reportResponses = reports.getContent().stream()
                .map(report -> {
                    String contentPreview = getContentPreview(report);
                    return buildReportResponse(report, contentPreview);
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(reportResponses, pageable, reports.getTotalElements());
    }

    @Override
    public ReportResponse getReportById(String reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.REPORT_NOT_FOUND)));
        
        String contentPreview = getContentPreview(report);
        return buildReportResponse(report, contentPreview);
    }

    @Override
    @Transactional
    public ReportResponse resolveReport(String reportId, ResolveReportRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.REPORT_NOT_FOUND)));
        
        if (report.getStatus() != ReportStatus.PENDING && report.getStatus() != ReportStatus.REVIEWING) {
            throw new BusinessException(languageService.getMessage(MessageCode.REPORT_ALREADY_PROCESSED));
        }
        
        report.setStatus(ReportStatus.RESOLVED);
        report.setResolvedAt(LocalDateTime.now());
        report.setResolvedBy(currentUserId);
        report.setResolution(request.getResolution());
        
        report = reportRepository.save(report);
        
        // Handle action if specified
        if (request.getAction() != null && !request.getAction().isEmpty()) {
            handleReportAction(report, request.getAction());
        }
        
        String contentPreview = getContentPreview(report);
        return buildReportResponse(report, contentPreview);
    }

    @Override
    @Transactional
    public ReportResponse dismissReport(String reportId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.REPORT_NOT_FOUND)));
        
        if (report.getStatus() != ReportStatus.PENDING && report.getStatus() != ReportStatus.REVIEWING) {
            throw new BusinessException(languageService.getMessage(MessageCode.REPORT_ALREADY_PROCESSED));
        }
        
        report.setStatus(ReportStatus.DISMISSED);
        report.setResolvedAt(LocalDateTime.now());
        report.setResolvedBy(currentUserId);
        report.setResolution("Report dismissed - no action taken");
        
        report = reportRepository.save(report);
        
        // Restore post status if it was REPORTED
        if (report.getContentType() == ReportContentType.POST) {
            Post post = postRepository.findById(report.getReportedContentId())
                    .orElse(null);
            if (post != null && post.getStatus() == PostStatus.REPORTED) {
                post.setStatus(PostStatus.POSTED);
                postRepository.save(post);
            }
        }
        
        String contentPreview = getContentPreview(report);
        return buildReportResponse(report, contentPreview);
    }

    private String getContentPreview(Report report) {
        if (report.getContentType() == ReportContentType.POST) {
            Post post = postRepository.findById(report.getReportedContentId()).orElse(null);
            if (post != null) {
                return post.getCaption() != null && !post.getCaption().isEmpty()
                        ? post.getCaption()
                        : "Post with " + (post.getImageUrls() != null ? post.getImageUrls().size() : 0) + " image(s)";
            }
        } else if (report.getContentType() == ReportContentType.COMMENT) {
            Comment comment = commentRepository.findById(report.getReportedContentId()).orElse(null);
            if (comment != null) {
                return comment.getContent() != null && !comment.getContent().isEmpty()
                        ? comment.getContent()
                        : "Comment";
            }
        }
        return "Content not available";
    }

    private void handleReportAction(Report report, String action) {
        if ("DELETE".equalsIgnoreCase(action)) {
            if (report.getContentType() == ReportContentType.POST) {
                postService.softDeletePost(report.getReportedContentId());
            } else if (report.getContentType() == ReportContentType.COMMENT) {
                // TODO: Implement comment deletion
                log.warn("Comment deletion not yet implemented");
            }
        } else if ("WARN".equalsIgnoreCase(action)) {
            // TODO: Implement warning system
            log.warn("Warning system not yet implemented");
        }
    }

    private ReportResponse buildReportResponse(Report report, String contentPreview) {
        User reporter = userRepository.findById(report.getReporterId()).orElse(null);
        User reportedUser = userRepository.findById(report.getReportedUserId()).orElse(null);
        User resolvedByUser = report.getResolvedBy() != null 
                ? userRepository.findById(report.getResolvedBy()).orElse(null) 
                : null;
        
        String currentUserId = SecurityUtil.getCurrentUserId();
        
        FollowInfo reporterFollowInfo = reporter != null 
                ? followService.resolveFollowInfo(reporter.getId(), currentUserId) 
                : null;
        FollowInfo reportedUserFollowInfo = reportedUser != null 
                ? followService.resolveFollowInfo(reportedUser.getId(), currentUserId) 
                : null;
        FollowInfo resolvedByFollowInfo = resolvedByUser != null 
                ? followService.resolveFollowInfo(resolvedByUser.getId(), currentUserId) 
                : null;
        
        UserPostResponse reporterResponse = reporter != null 
                ? userMapper.toUserPostResponse(reporter, reporterFollowInfo) 
                : null;
        UserPostResponse reportedUserResponse = reportedUser != null 
                ? userMapper.toUserPostResponse(reportedUser, reportedUserFollowInfo) 
                : null;
        UserPostResponse resolvedByResponse = resolvedByUser != null 
                ? userMapper.toUserPostResponse(resolvedByUser, resolvedByFollowInfo) 
                : null;
        
        return ReportResponse.builder()
                .id(report.getId())
                .reporter(reporterResponse)
                .contentType(report.getContentType())
                .reportedContentId(report.getReportedContentId())
                .reportedUser(reportedUserResponse)
                .reason(report.getReason())
                .status(report.getStatus())
                .resolvedAt(report.getResolvedAt())
                .resolvedByUser(resolvedByResponse)
                .resolution(report.getResolution())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .reportedContentPreview(contentPreview)
                .build();
    }
}






