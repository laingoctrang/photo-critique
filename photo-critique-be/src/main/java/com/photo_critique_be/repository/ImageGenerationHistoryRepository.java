package com.photo_critique_be.repository;

import com.photo_critique_be.model.ImageGenerationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImageGenerationHistoryRepository extends MongoRepository<ImageGenerationHistory, String> {
    Page<ImageGenerationHistory> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Optional<ImageGenerationHistory> findByIdAndUserId(String id, String userId);
}

