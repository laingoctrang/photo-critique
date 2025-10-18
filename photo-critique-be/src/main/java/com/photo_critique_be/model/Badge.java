package com.photo_critique_be.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "badges")
public class Badge {
    @Id
    private String id;

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("icon_url")
    private String iconUrl;

    @Field("xp_threshold")
    private Integer xpThreshold;

    @Field("level")
    private Integer level;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
