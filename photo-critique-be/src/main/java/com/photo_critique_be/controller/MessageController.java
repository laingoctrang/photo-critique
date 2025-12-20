package com.photo_critique_be.controller;

import com.photo_critique_be.dto.request.message.SendMessageRequest;
import com.photo_critique_be.dto.response.ApiResponse;
import com.photo_critique_be.dto.response.common.PageResponse;
import com.photo_critique_be.dto.response.message.ConversationResponse;
import com.photo_critique_be.dto.response.message.MessageResponse;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final LanguageService languageService;

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getUserConversations() {
        List<ConversationResponse> conversations = messageService.getUserConversations();
        return ResponseEntity.ok(ApiResponse.success(conversations, "Conversations retrieved successfully"));
    }

    @GetMapping("/conversations/{otherUserId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getOrCreateConversation(@PathVariable String otherUserId) {
        ConversationResponse conversation = messageService.getOrCreateConversation(otherUserId);
        return ResponseEntity.ok(ApiResponse.success(conversation, "Conversation retrieved successfully"));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getConversationMessages(
            @PathVariable String conversationId,
            @PageableDefault(size = 50) Pageable pageable) {
        PageResponse<MessageResponse> messages = messageService.getConversationMessages(conversationId, pageable);
        return ResponseEntity.ok(ApiResponse.success(messages, "Messages retrieved successfully"));
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        MessageResponse message = messageService.sendMessage(request);
        return ResponseEntity.ok(ApiResponse.created(message, "Message sent successfully"));
    }

    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markMessagesAsRead(@PathVariable String conversationId) {
        messageService.markMessagesAsRead(conversationId);
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read"));
    }
}

