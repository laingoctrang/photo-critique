package com.photo_critique_be.repository;

import com.photo_critique_be.model.Badge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends MongoRepository<Badge, String> {

    Optional<Badge> findByName(String name);

    List<Badge> findByLevel(Integer level);

    List<Badge> findByXpThresholdGreaterThanEqual(Integer xpThreshold);

    List<Badge> findByXpThresholdLessThanEqual(Integer xpThreshold);

    List<Badge> findByXpThresholdBetween(Integer minXp, Integer maxXp);

    List<Badge> findByLevelOrderByXpThresholdAsc(Integer level);

    List<Badge> findByLevelOrderByXpThresholdDesc(Integer level);

    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Badge> findByNameContainingIgnoreCase(String name);

    @Query("{ 'description': { $regex: ?0, $options: 'i' } }")
    List<Badge> findByDescriptionContaining(String keyword);

    @Query(value = "{}", sort = "{ 'xpThreshold': -1 }")
    List<Badge> findTopByOrderByXpThresholdDesc();

    @Query(value = "{}", sort = "{ 'xpThreshold': 1 }")
    List<Badge> findTopByOrderByXpThresholdAsc();

    @Query(value = "{}", sort = "{ 'level': 1, 'xpThreshold': 1 }")
    List<Badge> findAllOrderByLevelAscXpThresholdAsc();

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, String id);

    long countByLevel(Integer level);

    List<Badge> findByIdIn(List<String> ids);
}
