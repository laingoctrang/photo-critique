package com.photo_critique_be.model;

import com.photo_critique_be.enums.AuthProvider;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.enums.Role;
import com.photo_critique_be.model.embedded.BadgeEarned;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Field("username")
    @Indexed(unique = true)
    private String username;

    @Field("email")
    @Indexed(unique = true)
    private String email;

    @Field("password")
    private String password;

    @Field("profile_picture")
    private String profilePicture;

    @Field("bio")
    private String bio;

    @Field("full_name")
    private String fullName;

    @Field("is_online")
    private Boolean isOnline = false;

    @Field("last_seen")
    private LocalDateTime lastSeen;

    @Field("privacy_setting")
    private PrivacyType privacySetting = PrivacyType.PUBLIC;

    @Field("xp_points")
    private Integer xpPoints = 0;

    @Field("level") 
    private Integer level = 1;

    @Field("badges")
    private List<BadgeEarned> badges = new ArrayList<>();

    @Field("followers_count")
    private Integer followersCount = 0;

    @Field("following_count")
    private Integer followingCount = 0;

    @Field("roles")
    private List<Role> roles = List.of(Role.USER);

    @Field("enabled")
    private boolean enabled = true;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Field("auth_provider")
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Field("provider_id")
    private String providerId;
}