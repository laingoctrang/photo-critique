package com.photo_critique_be.repository;

import com.photo_critique_be.model.XPEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface XPEventRepository extends MongoRepository<XPEvent, String> {
    List<XPEvent> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<XPEvent> findByUserId(String userId, Pageable pageable);
    Long countByUserId(String userId);
//    Long sumPointsByUserId(String userId);
}