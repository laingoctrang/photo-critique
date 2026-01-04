package com.photo_critique_be.service.impl;

import com.photo_critique_be.dto.request.message.SendMessageRequest;
import com.photo_critique_be.dto.response.common.PageResponse;
import com.photo_critique_be.dto.response.message.ConversationResponse;
import com.photo_critique_be.dto.response.message.ConversationUserResponse;
import com.photo_critique_be.dto.response.message.LastMessageResponse;
import com.photo_critique_be.dto.response.message.MessageResponse;
import com.photo_critique_be.dto.response.user.UserListItemResponse;
import com.photo_critique_be.enums.MessageType;
import com.photo_critique_be.enums.MessageCode;
import com.photo_critique_be.enums.Role;
import com.photo_critique_be.exception.ResourceNotFoundException;
import com.photo_critique_be.model.Conversation;
import com.photo_critique_be.model.Message;
import com.photo_critique_be.model.User;
import com.photo_critique_be.model.embedded.ImageInfo;
import com.photo_critique_be.model.embedded.LastMessage;
import com.photo_critique_be.repository.ConversationRepository;
import com.photo_critique_be.repository.MessageRepository;
import com.photo_critique_be.repository.UserRepository;
import com.photo_critique_be.service.LanguageService;
import com.photo_critique_be.service.MessageService;
import com.photo_critique_be.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final LanguageService languageService;

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations() {
        String currentUserId = SecurityUtil.getCurrentUserId();

        List<Conversation> conversations = conversationRepository
                .findByParticipantsContainingOrderByUpdatedAtDesc(currentUserId);

        return conversations.stream()
                .map(conv -> {
                    // Find the other participant (not current user)
                    String otherParticipantId = conv.getParticipants().stream()
                            .filter(p -> !p.equals(currentUserId))
                            .findFirst()
                            .orElse(null);

                    if (otherParticipantId == null) {
                        return null;
                    }

                    User otherUser = userRepository.findById(otherParticipantId)
                            .orElse(null);

                    if (otherUser == null) {
                        return null;
                    }

                    // Count unread messages for current user
                    long unreadCount = messageRepository.countByConversationIdAndIsReadFalse(conv.getId().toString());

                    return ConversationResponse.builder()
                            .id(conv.getId().toString())
                            .otherUser(ConversationUserResponse.builder()
                                    .id(otherUser.getId())
                                    .username(otherUser.getUsername())
                                    .fullName(otherUser.getFullName())
                                    .profilePicture(otherUser.getProfilePicture())
                                    .isOnline(otherUser.getIsOnline())
                                    .build())
                            .lastMessage(conv.getLastMessage() != null ? LastMessageResponse.builder()
                                    .content(conv.getLastMessage().getContent())
                                    .sentAt(conv.getLastMessage().getSentAt())
                                    .senderId(conv.getLastMessage().getSenderId())
                                    .build() : null)
                            .unreadCount((int) unreadCount)
                            .createdAt(conv.getCreatedAt())
                            .updatedAt(conv.getUpdatedAt())
                            .build();
                })
                .filter(conv -> conv != null)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ConversationResponse getOrCreateConversation(String otherUserId) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        // Check if conversation already exists
        List<String> participants = List.of(currentUserId, otherUserId);
        Conversation existingConversation = conversationRepository
                .findByParticipantsContainsAllAndSize(participants, 2)
                .orElse(null);

        if (existingConversation != null) {
            return mapToConversationResponse(existingConversation, currentUserId, otherUserId);
        }

        // Create new conversation
        Conversation newConversation = new Conversation();
        newConversation.setParticipants(participants);
        newConversation.setUnreadCount(0);
        newConversation = conversationRepository.save(newConversation);

        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        return ConversationResponse.builder()
                .id(newConversation.getId().toString())
                .otherUser(ConversationUserResponse.builder()
                        .id(otherUser.getId())
                        .username(otherUser.getUsername())
                        .fullName(otherUser.getFullName())
                        .profilePicture(otherUser.getProfilePicture())
                        .isOnline(otherUser.getIsOnline())
                        .build())
                .lastMessage(null)
                .unreadCount(0)
                .createdAt(newConversation.getCreatedAt())
                .updatedAt(newConversation.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MessageResponse> getConversationMessages(String conversationId, Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        // Verify user is participant
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getParticipants().contains(currentUserId)) {
            throw new ResourceNotFoundException("Conversation not found");
        }

        Page<Message> messagesPage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);

        List<MessageResponse> messageResponses = messagesPage.getContent().stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());

        // Reverse to show oldest first (since we sorted DESC)
        List<MessageResponse> reversed = new ArrayList<>(messageResponses);
        java.util.Collections.reverse(reversed);

        return PageResponse.<MessageResponse>builder()
                .content(reversed)
                .page(messagesPage.getNumber())
                .size(messagesPage.getSize())
                .totalElements(messagesPage.getTotalElements())
                .totalPages(messagesPage.getTotalPages())
                .hasNext(messagesPage.hasNext())
                .hasPrevious(messagesPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        String receiverId = request.getReceiverId();

        // Get or create conversation
        ConversationResponse conversationResponse = getOrCreateConversation(receiverId);
        String conversationId = conversationResponse.getId();

        // Create message
        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(currentUserId);
        message.setReceiverId(receiverId);
        message.setContent(request.getContent());
        
        // Determine message type and handle images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            message.setMessageType(MessageType.IMAGE);
            
            // Convert imageUrls to List<ImageInfo>
            List<ImageInfo> imageInfos = request.getImageUrls().stream()
                    .map(url -> {
                        ImageInfo imageInfo = new ImageInfo();
                        imageInfo.setUrl(url);
                        // Extract filename from URL if possible
                        String filename = url.substring(url.lastIndexOf('/') + 1);
                        imageInfo.setName(filename);
                        return imageInfo;
                    })
                    .collect(Collectors.toList());
            
            message.setImages(imageInfos);
        } else {
            message.setMessageType(MessageType.TEXT);
        }
        
        message.setIsRead(false);
        message = messageRepository.save(message);

        // Update conversation's last message
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        LastMessage lastMessage = new LastMessage();
        lastMessage.setContent(request.getContent() != null ? request.getContent() : "[Image]");
        lastMessage.setSentAt(message.getCreatedAt());
        lastMessage.setSenderId(currentUserId);

        conversation.setLastMessage(lastMessage);
        conversation.setUnreadCount(0); // Reset for sender
        conversationRepository.save(conversation);

        return mapToMessageResponse(message);
    }

    @Override
    @Transactional
    public void markMessagesAsRead(String conversationId) {
        String currentUserId = SecurityUtil.getCurrentUserId();

        // Verify user is participant
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.getParticipants().contains(currentUserId)) {
            throw new ResourceNotFoundException("Conversation not found");
        }

        // Mark all unread messages from this conversation as read
        List<Message> unreadMessages = messageRepository.findByConversationIdAndIsReadFalse(conversationId);
        for (Message message : unreadMessages) {
            if (message.getReceiverId().equals(currentUserId)) {
                message.setIsRead(true);
                message.setReadAt(LocalDateTime.now());
            }
        }
        messageRepository.saveAll(unreadMessages);

        // Update conversation unread count
        conversation.setUnreadCount(0);
        conversationRepository.save(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserListItemResponse> searchUsersForChat(String query, Pageable pageable) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        
        if (query == null || query.trim().isEmpty()) {
            return PageResponse.<UserListItemResponse>builder()
                    .content(new ArrayList<>())
                    .page(0)
                    .size(pageable.getPageSize())
                    .totalElements(0L)
                    .totalPages(0)
                    .hasNext(false)
                    .hasPrevious(false)
                    .build();
        }
        
        String queryLower = query.toLowerCase().trim();
        
        // Get all users (excluding current user) and filter by fullName
        List<User> allUsers = userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(Role.USER))
                .filter(user -> !user.getId().equals(currentUserId))
                .filter(user -> user.getFullName() != null && 
                        user.getFullName().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());
        
        // Calculate pagination
        int totalElements = allUsers.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), totalElements);
        
        List<User> paginatedUsers = allUsers.subList(
                Math.min(start, totalElements), 
                Math.min(end, totalElements)
        );
        
        // Map to UserListItemResponse
        List<UserListItemResponse> userResponses = paginatedUsers.stream()
                .map(user -> UserListItemResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .profilePicture(user.getProfilePicture())
                        .isOnline(user.getIsOnline())
                        .build())
                .collect(Collectors.toList());
        
        int totalPages = (int) Math.ceil((double) totalElements / pageable.getPageSize());
        
        return PageResponse.<UserListItemResponse>builder()
                .content(userResponses)
                .page(pageable.getPageNumber())
                .size(pageable.getPageSize())
                .totalElements((long) totalElements)
                .totalPages(totalPages)
                .hasNext(pageable.getPageNumber() < totalPages - 1)
                .hasPrevious(pageable.getPageNumber() > 0)
                .build();
    }

    private ConversationResponse mapToConversationResponse(Conversation conversation, String currentUserId, String otherUserId) {
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException(languageService.getMessage(MessageCode.USER_NOT_FOUND)));

        long unreadCount = messageRepository.countByConversationIdAndIsReadFalse(conversation.getId().toString());

        return ConversationResponse.builder()
                .id(conversation.getId().toString())
                .otherUser(ConversationUserResponse.builder()
                        .id(otherUser.getId())
                        .username(otherUser.getUsername())
                        .fullName(otherUser.getFullName())
                        .profilePicture(otherUser.getProfilePicture())
                        .isOnline(otherUser.getIsOnline())
                        .build())
                .lastMessage(conversation.getLastMessage() != null ? LastMessageResponse.builder()
                        .content(conversation.getLastMessage().getContent())
                        .sentAt(conversation.getLastMessage().getSentAt())
                        .senderId(conversation.getLastMessage().getSenderId())
                        .build() : null)
                .unreadCount((int) unreadCount)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

    private MessageResponse mapToMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .imageUrls(message.getImages() != null ? 
                    message.getImages().stream()
                        .map(img -> img.getUrl())
                        .collect(Collectors.toList()) : null)
                .messageType(message.getMessageType())
                .isRead(message.getIsRead())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }
}

