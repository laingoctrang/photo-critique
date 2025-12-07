package com.photo_critique_be.repository;

import com.photo_critique_be.enums.ReactionTargetType;
import com.photo_critique_be.enums.ReactionType;
import com.photo_critique_be.model.Reaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends MongoRepository<Reaction, String> {

    // get user's reaction for list posts
    @Query("{ user_id: ?0, target_id: { $in: ?1 }, target_type: ?2 }")
    List<Reaction> findByUserIdAndTargetIdInAndTargetType(String userId, List<String> targetIds, ReactionTargetType targetType);

    @Query(value = "{ target_id: ?0, target_type: ?1 }", count = true)
    long countByTargetIdAndTargetType(String targetId, ReactionTargetType targetType);

    Optional<Reaction> findByUserIdAndTargetIdAndTargetType(String userId, String targetId, ReactionTargetType targetType);

    @Query(value = "{ target_id: ?0, target_type: ?1, reaction_type: ?2 }", count = true)
    long countByTargetIdAndTargetTypeAndReactionType(
            String targetId,
            ReactionTargetType targetType,
            ReactionType reactionType
    );

    void deleteByUserIdAndTargetId(String userId, String targetId);
}