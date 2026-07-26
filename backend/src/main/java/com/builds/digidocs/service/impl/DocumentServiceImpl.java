package com.builds.digidocs.service.impl;
import java.util.*;

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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

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
}