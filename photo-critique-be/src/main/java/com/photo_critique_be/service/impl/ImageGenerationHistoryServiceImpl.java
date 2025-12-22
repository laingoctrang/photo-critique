package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.request.imagegeneration.CreateImageGenerationHistoryRequest;
import com.photo_critique_be.dto.response.imagegeneration.ImageGenerationHistoryResponse;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.exception.AuthorizationException;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.mapper.ImageGenerationHistoryMapper;
import com.photo_critique_be.model.ImageGenerationHistory;
import com.photo_critique_be.repository.ImageGenerationHistoryRepository;
import com.photo_critique_be.service.ImageGenerationHistoryService;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageGenerationHistoryServiceImpl implements ImageGenerationHistoryService {

    private final ImageGenerationHistoryRepository repository;
    private final ImageGenerationHistoryMapper mapper;
    private final LanguageService languageService;

    @Override
    @Transactional
    public ImageGenerationHistoryResponse create(CreateImageGenerationHistoryRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        ImageGenerationHistory history = new ImageGenerationHistory();
        history.setUserId(currentUserId);
        history.setPrompt(request.getPrompt());
        history.setInputImageUrl(request.getInputImageUrl());
        history.setOutImageUrl(request.getOutImageUrl());

        history = repository.save(history);

        return mapper.toResponse(history);
    }

    @Override
    public ImageGenerationHistoryResponse getById(String id) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        
        ImageGenerationHistory history = repository.findByIdAndUserId(id, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.IMAGE_GENERATION_HISTORY_NOT_FOUND)));

        return mapper.toResponse(history);
    }

    @Override
    public Page<ImageGenerationHistoryResponse> getMyHistory(Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        
        Page<ImageGenerationHistory> histories = repository.findByUserIdOrderByCreatedAtDesc(currentUserId, pageable);
        
        return new PageImpl<>(
                histories.getContent().stream()
                        .map(mapper::toResponse)
                        .collect(Collectors.toList()),
                pageable,
                histories.getTotalElements()
        );
    }

    @Override
    @Transactional
    public void delete(String id) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        
        ImageGenerationHistory history = repository.findByIdAndUserId(id, currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.IMAGE_GENERATION_HISTORY_NOT_FOUND)));

        repository.delete(history);
    }
}

