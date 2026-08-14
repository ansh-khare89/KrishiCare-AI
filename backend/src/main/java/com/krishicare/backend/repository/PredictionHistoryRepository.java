package com.krishicare.backend.repository;

import com.krishicare.backend.model.PredictionHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {

    // Session-scoped (guest)
    Page<PredictionHistory> findBySessionIdOrderByTimestampDesc(String sessionId, Pageable pageable);
    long countBySessionId(String sessionId);

    @Query("SELECT COUNT(p) FROM PredictionHistory p WHERE p.sessionId = :sessionId AND LOWER(p.rawClass) LIKE '%healthy%'")
    long countHealthyBySessionId(String sessionId);

    @Query("SELECT p.cropName, COUNT(p) FROM PredictionHistory p WHERE p.sessionId = :sessionId GROUP BY p.cropName")
    List<Object[]> countByCropForSession(String sessionId);

    @Query("SELECT p.diseaseName, COUNT(p) FROM PredictionHistory p WHERE p.sessionId = :sessionId GROUP BY p.diseaseName ORDER BY COUNT(p) DESC")
    List<Object[]> countByDiseaseForSession(String sessionId);

    // User-scoped (authenticated)
    Page<PredictionHistory> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    long countByUserId(Long userId);

    @Query("SELECT COUNT(p) FROM PredictionHistory p WHERE p.userId = :userId AND LOWER(p.rawClass) LIKE '%healthy%'")
    long countHealthyByUserId(Long userId);

    @Query("SELECT p.cropName, COUNT(p) FROM PredictionHistory p WHERE p.userId = :userId GROUP BY p.cropName")
    List<Object[]> countByCropForUser(Long userId);

    @Query("SELECT p.diseaseName, COUNT(p) FROM PredictionHistory p WHERE p.userId = :userId GROUP BY p.diseaseName ORDER BY COUNT(p) DESC")
    List<Object[]> countByDiseaseForUser(Long userId);
}

