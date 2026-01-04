package com.photo_critique_be.dto.request.message;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class SendMessageRequest {
    @NotBlank(message = "Receiver ID is required")
    private String receiverId;
    
    private String content;
    
    private List<String> imageUrls;
}

