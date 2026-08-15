package com.builds.digidocs.service.impl;

import com.builds.digidocs.dto.TagDto;
import com.builds.digidocs.entity.Document;
import com.builds.digidocs.entity.Tag;
import com.builds.digidocs.entity.User;
import com.builds.digidocs.exception.DocumentNotFoundException;
import com.builds.digidocs.exception.InvalidRequestException;
import com.builds.digidocs.exception.UserNotFoundException;
import com.builds.digidocs.mapper.TagMapper;
import com.builds.digidocs.repository.DocumentRepository;
import com.builds.digidocs.repository.TagRepository;
import com.builds.digidocs.repository.UserRepository;
import com.builds.digidocs.service.TagService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final TagMapper tagMapper;

    public TagServiceImpl(TagRepository tagRepository, DocumentRepository documentRepository, UserRepository userRepository, TagMapper tagMapper) {
        this.tagRepository = tagRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.tagMapper = tagMapper;
    }

    @Override
    public List<TagDto> getAllTags(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return tagRepository.findByUser(user).stream()
                .map(tagMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TagDto createTag(String email, TagDto tagDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        if (tagRepository.existsByNameAndUser(tagDto.getName(), user)) {
            throw new InvalidRequestException("Tag with this name already exists");
        }

        Tag tag = new Tag(tagDto.getName(), tagDto.getColor(), user);
        Tag saved = tagRepository.save(tag);
        return tagMapper.toDto(saved);
    }

    @Override
    public void deleteTag(Long tagId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new InvalidRequestException("Tag not found"));
                
        if (!tag.getUser().getId().equals(user.getId())) {
            throw new InvalidRequestException("Unauthorized to delete this tag");
        }
        
        // Remove tag from all documents first
        for (Document doc : tag.getDocuments()) {
            doc.getTags().remove(tag);
            documentRepository.save(doc);
        }
        
        tagRepository.delete(tag);
    }

    @Override
    public void assignTagToDocument(Long documentId, Long tagId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
                
        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNull(documentId, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
                
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new InvalidRequestException("Tag not found"));
                
        if (!tag.getUser().getId().equals(user.getId())) {
            throw new InvalidRequestException("Unauthorized to use this tag");
        }
        
        document.getTags().add(tag);
        documentRepository.save(document);
    }

    @Override
    public void removeTagFromDocument(Long documentId, Long tagId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
                
        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNull(documentId, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
                
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new InvalidRequestException("Tag not found"));
                
        document.getTags().remove(tag);
        documentRepository.save(document);
    }
}
