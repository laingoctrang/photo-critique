package com.photo_critique_be.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "image_generation_history")
public class ImageGenerationHistory {
    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("prompt")
    private String prompt;

    @Field("input_image_url")
    private String input_image_url;

    @Field("out_image_url")
    private String out_image_url;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;
}
