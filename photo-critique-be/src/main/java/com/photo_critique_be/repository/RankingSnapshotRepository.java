package com.photo_critique_be.repository;

import com.photo_critique_be.enums.RankingPeriod;
import com.photo_critique_be.enums.RankingType;
import com.photo_critique_be.model.RankingSnapshot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RankingSnapshotRepository extends MongoRepository<RankingSnapshot, String> {
    Optional<RankingSnapshot> findTopByTypeAndPeriodOrderBySnapshotDateDesc(
            RankingType type, 
            RankingPeriod period
    );
    
    Optional<RankingSnapshot> findByTypeAndPeriodAndSnapshotDate(
            RankingType type, 
            RankingPeriod period, 
            LocalDateTime snapshotDate
    );
    
    void deleteBySnapshotDateBefore(LocalDateTime date);
}

