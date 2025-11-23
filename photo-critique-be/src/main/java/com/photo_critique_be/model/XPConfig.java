package com.photo_critique_be.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "xp_configs")
public class XPConfig {
    @Id
    private String id;

    @Field("event_type")
    private String eventType;

    @Field("name")
    private String name;

    @Field("points")
    private Integer points;

    @Field("description")
    private String description;

    @Field("is_active")
    private Boolean isActive;

    @Field("category")
    private String category;

    @Field("version")
    private Integer version;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}