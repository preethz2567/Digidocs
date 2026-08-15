package com.builds.digidocs.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.io.FileOutputStream;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Sort;

import com.builds.digidocs.dto.DocumentDownloadResponse;
import com.builds.digidocs.dto.DocumentResponse;
import com.builds.digidocs.dto.ShareResponse;
import com.builds.digidocs.entity.Document;
import com.builds.digidocs.entity.User;
import com.builds.digidocs.mapper.TagMapper;
import com.builds.digidocs.exception.DocumentNotFoundException;
import com.builds.digidocs.exception.UnauthorizedException;
import com.builds.digidocs.exception.UserNotFoundException;
import com.builds.digidocs.exception.InvalidRequestException;
import com.builds.digidocs.repository.DocumentRepository;
import com.builds.digidocs.repository.UserRepository;
import com.builds.digidocs.service.DocumentService;
import com.builds.digidocs.service.StorageService;
import com.builds.digidocs.exception.StorageException;


@Service
public class DocumentServiceImpl implements DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentServiceImpl.class);

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final TagMapper tagMapper;
    private final StorageService storageService;

    public DocumentServiceImpl(DocumentRepository documentRepository,
                               UserRepository userRepository,
                               TagMapper tagMapper,
                               StorageService storageService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.tagMapper = tagMapper;
        this.storageService = storageService;
    }

    private DocumentResponse mapToDocumentResponse(Document doc) {
        return new DocumentResponse(
                doc.getId(),
                doc.getOriginalFileName(),
                doc.getFileSize(),
                doc.getContentType(),
                doc.getUploadedAt(),
                doc.isStarred(),
                doc.getTags() != null ? doc.getTags().stream().map(tagMapper::toDto).collect(Collectors.toList()) : null
        );
    }

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

            String storedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String storageKey = "documents/" + user.getId() + "/" + storedFileName;

            storageService.upload(storageKey, file.getInputStream(), file.getSize(), file.getContentType());

            Document document = new Document();
            document.setOriginalFileName(file.getOriginalFilename());
            document.setStoredFileName(storedFileName);
            document.setFilePath(storageKey);
            document.setFileSize(file.getSize());
            document.setContentType(file.getContentType());
            document.setUploadedAt(LocalDateTime.now());
            document.setUser(user);

            Document saved = documentRepository.save(document);
            logger.info("Document uploaded: {} by {}", saved.getOriginalFileName(), email);

            return mapToDocumentResponse(saved);
        } catch (IOException e) {
            logger.error("File upload failed", e);
            throw new RuntimeException("File upload failed", e);
        } catch (StorageException e) {
            logger.error("Storage upload failed", e);
            throw new RuntimeException("Storage upload failed", e);
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

        return documentRepository.findByUserAndDeletedAtIsNull(user, sorting)
                .stream()
                .map(this::mapToDocumentResponse)
                .toList();
    }

    @Override
    public DocumentDownloadResponse downloadDocument(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Document document = documentRepository
                .findByIdAndUserAndDeletedAtIsNull(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        try {
            String downloadUrl = storageService.generateDownloadUrl(document.getFilePath(), document.getOriginalFileName());

            logger.info("Generated download URL for document: {} by {}", document.getOriginalFileName(), email);

            return new DocumentDownloadResponse(
                    downloadUrl,
                    document.getOriginalFileName()
            );
        } catch (StorageException e) {
            logger.error("Unable to generate download URL", e);
            throw new RuntimeException("Unable to generate download URL");
        }
    }

    @Override
    public void deleteDocument(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNull(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found or already deleted"));

        document.setDeletedAt(LocalDateTime.now());
        documentRepository.save(document);
    }

    @Override
    public List<DocumentResponse> searchDocuments(String email, String keyword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return documentRepository
                .findByUserAndOriginalFileNameContainingIgnoreCaseAndDeletedAtIsNull(user, keyword)
                .stream()
                .map(this::mapToDocumentResponse)
                .toList();
    }

    @Override
    public DocumentResponse renameDocument(Long id, String email, String newName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNull(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        document.setOriginalFileName(newName);

        Document saved = documentRepository.save(document);
        logger.info("Document renamed to {} by {}", saved.getOriginalFileName(), email);

        return mapToDocumentResponse(saved);
    }

    @Override
    public DocumentResponse getDocument(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNull(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        logger.info("Metadata viewed for document {} by {}", document.getId(), email);

        return mapToDocumentResponse(document);
    }

    @Override
    public ShareResponse shareDocument(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNull(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        if (document.getShareToken() == null ||
            document.getShareExpiry() == null ||
            document.getShareExpiry().isBefore(LocalDateTime.now())) {

            document.setShareToken(UUID.randomUUID().toString());
            document.setShareExpiry(LocalDateTime.now().plusDays(7));

            documentRepository.save(document);
        }

        logger.info("Share link generated for document {} by {}", document.getId(), email);
        return new ShareResponse(document.getShareToken());
    }

    @Override
    public DocumentDownloadResponse downloadSharedDocument(String shareToken) {
        Document document = documentRepository.findByShareTokenAndDeletedAtIsNull(shareToken)
                .orElseThrow(() -> new DocumentNotFoundException("Shared document not found"));

        if (document.getShareExpiry() == null ||
            document.getShareExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Share link has expired");
        }

        try {
            String downloadUrl = storageService.generateDownloadUrl(document.getFilePath(), document.getOriginalFileName());
            logger.info("Generated download URL for shared document: {}", document.getOriginalFileName());
            return new DocumentDownloadResponse(
                    downloadUrl,
                    document.getOriginalFileName()
            );
        } catch (StorageException e) {
            throw new RuntimeException("File not found");
        }
    }

    @Override
    public void revokeShare(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNull(id, user)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        document.setShareToken(null);
        document.setShareExpiry(null);

        documentRepository.save(document);

        logger.info("Share link revoked for document {} by {}", document.getId(), email);
    }

    @Override
    public DocumentResponse toggleStar(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNull(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        document.setStarred(!document.isStarred());
        Document saved = documentRepository.save(document);

        logger.info("Document {} starred status toggled to {} by {}", saved.getId(), saved.isStarred(), email);

        return mapToDocumentResponse(saved);
    }

    @Override
    public Resource downloadMultipleAsZip(List<Long> ids, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<Document> documents = documentRepository.findAllById(ids);
        
        for (Document doc : documents) {
            if (!doc.getUser().getId().equals(user.getId()) || doc.getDeletedAt() != null) {
                throw new UnauthorizedException("Access denied for document: " + doc.getOriginalFileName());
            }
        }

        if (documents.isEmpty()) {
            throw new InvalidRequestException("No documents found to download");
        }

        try {
            Path tempZip = Files.createTempFile("digidocs-export-", ".zip");
            
            try (FileOutputStream fos = new FileOutputStream(tempZip.toFile());
                 ZipOutputStream zos = new ZipOutputStream(fos)) {
                
                for (Document doc : documents) {
                    try {
                        Resource resource = storageService.download(doc.getFilePath());
                        ZipEntry zipEntry = new ZipEntry(doc.getOriginalFileName());
                        zos.putNextEntry(zipEntry);
                        try (InputStream is = resource.getInputStream()) {
                            is.transferTo(zos);
                        }
                        zos.closeEntry();
                    } catch (Exception e) {
                        logger.error("Failed to add file to zip: {}", doc.getOriginalFileName(), e);
                    }
                }
            }
            
            return new UrlResource(tempZip.toUri());
            
        } catch (IOException e) {
            logger.error("Failed to create zip file", e);
            throw new RuntimeException("Failed to create zip file");
        }
    }

    @Override
    public List<DocumentResponse> getDeletedDocuments(String email, String sortParam) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Sort sort = Sort.by(Sort.Direction.DESC, "deletedAt");
        List<Document> documents = documentRepository.findByUserAndDeletedAtIsNotNull(user, sort);

        return documents.stream()
                .map(this::mapToDocumentResponse)
                .toList();
    }

    @Override
    public DocumentResponse restoreDocument(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNotNull(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found in trash"));

        document.setDeletedAt(null);
        Document saved = documentRepository.save(document);

        return mapToDocumentResponse(saved);
    }

    @Override
    public void permanentlyDeleteDocument(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Document document = documentRepository.findByIdAndUserAndDeletedAtIsNotNull(id, user)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found in trash"));

        try {
            storageService.delete(document.getFilePath());
        } catch (StorageException e) {
            logger.error("Failed to delete file from storage", e);
        }

        documentRepository.delete(document);
    }
}
