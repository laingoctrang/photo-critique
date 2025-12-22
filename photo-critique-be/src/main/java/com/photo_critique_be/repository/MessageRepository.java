package com.photo_critique_be.repository;

import com.photo_critique_be.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    Page<Message> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);
    
    List<Message> findByConversationIdAndIsReadFalse(String conversationId);
    
    List<Message> findByReceiverIdAndIsReadFalse(String receiverId);
    
    long countByConversationIdAndIsReadFalse(String conversationId);
}

