package com.photo_critique_be.repository;

import com.photo_critique_be.model.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends MongoRepository<Tag, String> {
    Optional<Tag> findBySlug(String slug);
    Optional<Tag> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    boolean existsBySlug(String slug);

    Page<Tag> findByNameRegex(String regex, Pageable pageable); // for search
    List<Tag> findTop10ByOrderByPostCountDesc(); // quick trending
}
