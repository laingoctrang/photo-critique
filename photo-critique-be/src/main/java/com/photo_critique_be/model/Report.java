package com.photo_critique_be.model;

import com.photo_critique_be.enums.ReportContentType;
import com.photo_critique_be.enums.ReportStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reports")
@CompoundIndexes({
    @CompoundIndex(name = "status_created", def = "{'status': 1, 'created_at': -1}"),
    @CompoundIndex(name = "content_type_status", def = "{'content_type': 1, 'status': 1, 'created_at': -1}"),
    @CompoundIndex(name = "reported_content", def = "{'content_type': 1, 'reported_content_id': 1}")
})
public class Report {
    @Id
    private String id;

    @Field("reporter_id")
    @Indexed
    private String reporterId;

    @Field("content_type")
    @Indexed
    private ReportContentType contentType;

    @Field("reported_content_id")
    @Indexed
    private String reportedContentId;

    @Field("reported_user_id")
    @Indexed
    private String reportedUserId;

    @Field("reason")
    private String reason;

    @Field("status")
    @Indexed
    private ReportStatus status = ReportStatus.PENDING;

    @Field("resolved_at")
    private LocalDateTime resolvedAt;

    @Field("resolved_by")
    private String resolvedBy;

    @Field("resolution")
    private String resolution;

    @Field("created_at")
    @Indexed
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}






