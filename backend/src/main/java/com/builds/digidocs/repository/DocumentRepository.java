package com.builds.digidocs.repository;

import com.builds.digidocs.entity.Document;
import com.builds.digidocs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;


public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUser(User user);
    
    Optional<Document> findByIdAndUser(Long id, User user);
}