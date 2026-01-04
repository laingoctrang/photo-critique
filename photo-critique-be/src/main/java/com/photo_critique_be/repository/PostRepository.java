package com.photo_critique_be.repository;

import com.photo_critique_be.enums.PostStatus;
import com.photo_critique_be.enums.PrivacyType;
import com.photo_critique_be.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends MongoRepository<Post, String>, PostRepositoryCustom {
    // Query by status instead of isDeleted
    Page<Post> findByUserIdAndStatusInAndIsDeletedFalseOrderByCreatedAtDesc(String userId, List<PostStatus> statuses, Pageable pageable);
    Page<Post> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    long countByUserId(String userId);
    long countByUserIdAndStatusIn(String userId, List<PostStatus> statuses);

    Optional<Post> findByIdAndIsDeletedFalse(String id);
    Optional<Post> findByIdAndStatusIn(String id, List<PostStatus> statuses);

    Page<Post> findByStatusInAndPrivacyInOrderByCreatedAtDesc(List<PostStatus> statuses, List<PrivacyType> privacy, Pageable pageable);
    
    // Draft posts
    Page<Post> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, PostStatus status, Pageable pageable);
    
    // Keep old methods for backward compatibility
    @Deprecated
    Page<Post> findByIsDeletedFalseAndUserIdAndPrivacyInOrderByCreatedAtDesc(String userId, List<PrivacyType> privacyTypes, Pageable pageable);
    @Deprecated
    Page<Post> findByIsDeletedFalseAndPrivacyInOrderByCreatedAtDesc(List<PrivacyType> privacy, Pageable pageable);
    @Deprecated
    Page<Post> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(String userId, Pageable pageable);

    // Posts đã bị soft delete
    Page<Post> findByIsDeletedTrue(Pageable pageable);

    // Posts bị soft delete trước thời điểm nhất định
    @Query("{ 'is_deleted': true, 'deleted_at': { $lt: ?0 } }")
    List<Post> findByIsDeletedTrueAndDeletedAtBefore(LocalDateTime dateTime);

    // Đếm số post đã bị soft delete
    long countByIsDeletedTrue();

    List<Post> findAllByIdInAndIsDeletedFalse(List<String> ids);

    @Query(value = """
        {
            user_id: { $in: ?0 },
            privacy: { $in: ?1 },
            is_deleted: false
        }
        """,
            fields = """
        {
            _id: 1,
            caption: 1,
            image_urls: 1,
            privacy: 1,
            likes_count: 1,
            comments_count: 1,
            shares_count: 1,
            created_at: 1,
            user_id: 1
        }
        """,
            sort = "{ created_at: -1 }")
    List<Post> findFeedPostsProjected(
            List<String> userIds,
            List<PrivacyType> privacyTypes,
            Pageable pageable
    );

    @Query(value = """
        {
            user_id: { $in: ?0 },
            privacy: { $in: ?1 },
            is_deleted: false
        }
        """,
            count = true)
    long countFeedPosts(List<String> userIds, List<PrivacyType> privacyTypes);
}

