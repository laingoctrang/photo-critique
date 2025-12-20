package com.photo_critique_be.service;

import com.photo_critique_be.dto.request.message.SendMessageRequest;
import com.photo_critique_be.dto.response.common.PageResponse;
import com.photo_critique_be.dto.response.message.ConversationResponse;
import com.photo_critique_be.dto.response.message.MessageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MessageService {
    List<ConversationResponse> getUserConversations();
    
    ConversationResponse getOrCreateConversation(String otherUserId);
    
    PageResponse<MessageResponse> getConversationMessages(String conversationId, Pageable pageable);
    
    MessageResponse sendMessage(SendMessageRequest request);
    
    void markMessagesAsRead(String conversationId);
    
    ConversationResponse searchConversations(String searchTerm);
}

