package com.builds.digidocs.service.impl;
import java.util.*;

import com.builds.digidocs.dto.DocumentDownloadResponse;
import com.builds.digidocs.dto.DocumentResponse;
import com.builds.digidocs.entity.Document;
import com.builds.digidocs.entity.User;
import com.builds.digidocs.repository.DocumentRepository;
import com.builds.digidocs.repository.UserRepository;
import com.builds.digidocs.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public DocumentServiceImpl(DocumentRepository documentRepository,
                               UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public DocumentResponse uploadDocument(MultipartFile file, String email) {

        try {

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String storedFileName =
                    UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(storedFileName);

            Files.copy(file.getInputStream(), filePath);

            Document document = new Document();

            document.setOriginalFileName(file.getOriginalFilename());
            document.setStoredFileName(storedFileName);
            document.setFilePath(filePath.toString());
            document.setFileSize(file.getSize());
            document.setContentType(file.getContentType());
            document.setUploadedAt(LocalDateTime.now());
            document.setUser(user);

            Document saved = documentRepository.save(document);

            return new DocumentResponse(
                    saved.getId(),
                    saved.getOriginalFileName(),
                    saved.getFileSize(),
                    saved.getContentType(),
                    saved.getUploadedAt()
            );

        } catch (IOException e) {
            throw new RuntimeException("File upload failed");
        }
    }

    @Override
public List<DocumentResponse> getDocuments(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return documentRepository.findByUser(user)
            .stream()
            .map(document -> new DocumentResponse(
                    document.getId(),
                    document.getOriginalFileName(),
                    document.getFileSize(),
                    document.getContentType(),
                    document.getUploadedAt()
            ))
            .toList();
}

@Override
public DocumentDownloadResponse downloadDocument(Long id, String email) {

    try {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Path path = Paths.get(document.getFilePath());

        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("File not found");
        }

        return new DocumentDownloadResponse(
                resource,
                document.getOriginalFileName()
        );

    } catch (IOException e) {
        throw new RuntimeException("Unable to read file");
    }
}

@Override
public void deleteDocument(Long id, String email) {

    try {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Path path = Paths.get(document.getFilePath());

        Files.deleteIfExists(path);

        documentRepository.delete(document);

    } catch (IOException e) {
        throw new RuntimeException("Failed to delete document");
    }
}

@Override
public List<DocumentResponse> searchDocuments(String email, String keyword) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return documentRepository
            .findByUserAndOriginalFileNameContainingIgnoreCase(user, keyword)
            .stream()
            .map(document -> new DocumentResponse(
                    document.getId(),
                    document.getOriginalFileName(),
                    document.getFileSize(),
                    document.getContentType(),
                    document.getUploadedAt()
            ))
            .toList();
}

@Override
public DocumentResponse renameDocument(Long id, String email, String newName) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Document document = documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found"));

    if (!document.getUser().getId().equals(user.getId())) {
        throw new RuntimeException("Access denied");
    }

    document.setOriginalFileName(newName);

    Document saved = documentRepository.save(document);

    return new DocumentResponse(
            saved.getId(),
            saved.getOriginalFileName(),
            saved.getFileSize(),
            saved.getContentType(),
            saved.getUploadedAt()
    );
}
}