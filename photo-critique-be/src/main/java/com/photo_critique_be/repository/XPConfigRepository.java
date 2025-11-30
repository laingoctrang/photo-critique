package com.photo_critique_be.repository;

import com.photo_critique_be.model.XPConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface XPConfigRepository extends MongoRepository<XPConfig, String> {
    Optional<XPConfig> findByEventTypeAndIsActiveTrue(String eventType);
    Optional<XPConfig> findByEventType(String eventType);
    List<XPConfig> findAllByIsActiveTrue();
    boolean existsByEventType(String eventType);
}