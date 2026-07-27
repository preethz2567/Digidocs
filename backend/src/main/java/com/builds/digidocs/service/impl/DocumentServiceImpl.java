package com.builds.digidocs.service.impl;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.builds.digidocs.dto.DocumentDownloadResponse;
import com.builds.digidocs.dto.DocumentResponse;
import com.builds.digidocs.dto.ShareResponse;
import com.builds.digidocs.entity.Document;
import com.builds.digidocs.entity.User;
import org.springframework.data.domain.Sort;
import com.builds.digidocs.exception.DocumentNotFoundException;
import com.builds.digidocs.exception.UnauthorizedException;
import com.builds.digidocs.exception.UserNotFoundException;
import com.builds.digidocs.exception.InvalidRequestException;
import com.builds.digidocs.repository.DocumentRepository;
import com.builds.digidocs.repository.UserRepository;
import com.builds.digidocs.service.DocumentService;


@Service
public class DocumentServiceImpl implements DocumentService {

    private static final Logger logger =
    LoggerFactory.getLogger(DocumentServiceImpl.class);

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

            if (file.isEmpty()) {
            throw new InvalidRequestException("File cannot be empty");
             }
             if (file.getSize() > 10 * 1024 * 1024) {
             throw new InvalidRequestException("Maximum file size is 10 MB");
            }
            List<String> allowedTypes = List.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
);

if (!allowedTypes.contains(file.getContentType())) {
    throw new InvalidRequestException("Unsupported file type");
}

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

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
            logger.info("Document uploaded: {} by {}",
            saved.getOriginalFileName(),
            email);

            return new DocumentResponse(
                    saved.getId(),
                    saved.getOriginalFileName(),
                    saved.getFileSize(),
                    saved.getContentType(),
                    saved.getUploadedAt()
            );

        } catch (IOException e) {
            logger.error("File upload failed", e);
            throw new RuntimeException("File upload failed");
        }
    }

@Override
public List<DocumentResponse> getDocuments(String email, String sort) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Sort sorting;

    switch (sort.toLowerCase()) {
        case "name":
            sorting = Sort.by("originalFileName").ascending();
            break;

        case "size":
            sorting = Sort.by("fileSize").descending();
            break;

        case "date":
        default:
            sorting = Sort.by("uploadedAt").descending();
            break;
    }

    return documentRepository.findByUser(user, sorting)
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
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Document document = documentRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        Path path = Paths.get(document.getFilePath());

        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("File not found");
        }

        logger.info("Document downloaded: {} by {}",
        document.getOriginalFileName(),
        email);

        return new DocumentDownloadResponse(
                resource,
                document.getOriginalFileName()
        );

    } catch (IOException e) {
        logger.error("Unable to read file", e);
        throw new RuntimeException("Unable to read file");
    }
}

@Override
public void deleteDocument(Long id, String email) {

    try {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Document document = documentRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        Path path = Paths.get(document.getFilePath());

        Files.deleteIfExists(path);
        logger.info("Document deleted: {} by {}",
        document.getOriginalFileName(),
        email);

        documentRepository.delete(document);

    } catch (IOException e) {
        logger.error("Failed to delete document", e);
        throw new RuntimeException("Failed to delete document");
    }
}

@Override
public List<DocumentResponse> searchDocuments(String email, String keyword) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

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
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    Document document = documentRepository.findById(id)
            .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

    if (!document.getUser().getId().equals(user.getId())) {
        throw new UnauthorizedException("Access denied");
    }

    document.setOriginalFileName(newName);

    Document saved = documentRepository.save(document);
    logger.info("Document renamed to {} by {}",
        saved.getOriginalFileName(),
        email);

    return new DocumentResponse(
            saved.getId(),
            saved.getOriginalFileName(),
            saved.getFileSize(),
            saved.getContentType(),
            saved.getUploadedAt()
    );
}

@Override
public DocumentResponse getDocument(Long id, String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    Document document = documentRepository.findById(id)
            .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

    if (!document.getUser().getId().equals(user.getId())) {
        throw new UnauthorizedException("Access denied");
    }

    logger.info("Metadata viewed for document {} by {}",
        document.getId(),
        email);

    return new DocumentResponse(
            document.getId(),
            document.getOriginalFileName(),
            document.getFileSize(),
            document.getContentType(),
            document.getUploadedAt()
    );
}

@Override
public ShareResponse shareDocument(Long id, String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

    Document document = documentRepository.findById(id)
            .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

    if (!document.getUser().getId().equals(user.getId())) {
        throw new UnauthorizedException("Access denied");
    }

    if (document.getShareToken() == null ||
        document.getShareExpiry() == null ||
        document.getShareExpiry().isBefore(LocalDateTime.now())) {

    document.setShareToken(UUID.randomUUID().toString());
    document.setShareExpiry(LocalDateTime.now().plusDays(7));

    documentRepository.save(document);
}

    logger.info("Share link generated for document {} by {}",
        document.getId(),
        email);
    return new ShareResponse(document.getShareToken());
}

@Override
public DocumentDownloadResponse downloadSharedDocument(String shareToken) {

    Document document = documentRepository.findByShareToken(shareToken)
            .orElseThrow(() -> new DocumentNotFoundException("Shared document not found"));

    if (document.getShareExpiry() == null ||
        document.getShareExpiry().isBefore(LocalDateTime.now())) {

    throw new RuntimeException("Share link has expired");
}

    Resource resource;

    try {
        resource = new UrlResource(Paths.get(document.getFilePath()).toUri());
    } catch (MalformedURLException e) {
        throw new RuntimeException("File not found");
    }
    
    logger.info("Shared document downloaded: {}",
        document.getOriginalFileName());
    return new DocumentDownloadResponse(
            resource,
            document.getOriginalFileName()
    );
}

@Override
public void revokeShare(Long id, String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Document document = documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found"));

    if (!document.getUser().getId().equals(user.getId())) {
        throw new RuntimeException("Access denied");
    }

    document.setShareToken(null);
    document.setShareExpiry(null);

    documentRepository.save(document);

    logger.info("Share link revoked for document {} by {}",
            document.getId(),
            email);
}
}