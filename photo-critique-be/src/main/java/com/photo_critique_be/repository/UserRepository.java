package com.photo_critique_be.repository;

import com.photo_critique_be.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderId(String providerId);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    List<User> findByIdIn(List<String> ids);
}
