package com.photo_critique_be.repository;

import com.photo_critique_be.model.Conversation;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByParticipantsContainingOrderByUpdatedAtDesc(String participantId);

    @Query("{ 'participants': { $all: ?0, $size: ?1 } }")
    Optional<Conversation> findByParticipantsContainsAllAndSize(List<String> participants, int size);
}

