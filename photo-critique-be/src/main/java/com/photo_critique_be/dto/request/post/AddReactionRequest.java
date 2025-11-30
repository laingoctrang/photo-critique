package com.photo_critique_be.dto.request.post;

import com.photo_critique_be.enums.ReactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddReactionRequest {
    @NotNull(message = "Reaction type is required")
    private ReactionType reactionType;
}

