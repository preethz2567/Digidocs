package com.builds.digidocs.repository;

import com.builds.digidocs.entity.Document;
import com.builds.digidocs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.*;


public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserAndDeletedAtIsNull(User user);
    
    Optional<Document> findByIdAndUserAndDeletedAtIsNull(Long id, User user);
    
    List<Document> findByUserAndOriginalFileNameContainingIgnoreCaseAndDeletedAtIsNull(User user, String keyword);

    Optional<Document> findByShareTokenAndDeletedAtIsNull(String shareToken);

    List<Document> findByUserAndDeletedAtIsNull(User user, Sort sort);

    List<Document> findByUserAndDeletedAtIsNotNull(User user, Sort sort);

    Optional<Document> findByIdAndUserAndDeletedAtIsNotNull(Long id, User user);

}