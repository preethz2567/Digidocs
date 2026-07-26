package com.builds.digidocs.repository;

import com.builds.digidocs.entity.Document;
import com.builds.digidocs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUser(User user);

}