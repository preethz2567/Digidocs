package com.builds.digidocs.repository;

import com.builds.digidocs.entity.Document;
import com.builds.digidocs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.*;


public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUser(User user);
    
    Optional<Document> findByIdAndUser(Long id, User user);
    
    List<Document> findByUserAndOriginalFileNameContainingIgnoreCase(User user, String keyword);

    Optional<Document> findByShareToken(String shareToken);

    List<Document> findByUser(User user, Sort sort);

}