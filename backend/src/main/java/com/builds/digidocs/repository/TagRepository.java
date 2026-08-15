package com.builds.digidocs.repository;

import com.builds.digidocs.entity.Tag;
import com.builds.digidocs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findByUser(User user);
    boolean existsByNameAndUser(String name, User user);
}
