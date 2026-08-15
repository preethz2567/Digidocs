package com.builds.digidocs.service;

import com.builds.digidocs.dto.TagDto;

import java.util.List;

public interface TagService {
    List<TagDto> getAllTags(String email);
    TagDto createTag(String email, TagDto tagDto);
    void deleteTag(Long tagId, String email);
    void assignTagToDocument(Long documentId, Long tagId, String email);
    void removeTagFromDocument(Long documentId, Long tagId, String email);
}
