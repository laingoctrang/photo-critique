package com.photo_critique_be.repository;

import com.photo_critique_be.enums.XPConfigStatus;
import com.photo_critique_be.model.XPConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface XPConfigRepository extends MongoRepository<XPConfig, String> {
    Optional<XPConfig> findByEventTypeAndStatus(String eventType, XPConfigStatus status);
    Optional<XPConfig> findByEventType(String eventType);
    List<XPConfig> findAllByStatus(XPConfigStatus status);
    boolean existsByEventType(String eventType);
    
    // Keep for backward compatibility
    @Deprecated
    Optional<XPConfig> findByEventTypeAndIsActiveTrue(String eventType);
    @Deprecated
    List<XPConfig> findAllByIsActiveTrue();
}