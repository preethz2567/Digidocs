package com.builds.digidocs.service.impl;

import com.builds.digidocs.exception.StorageException;
import com.builds.digidocs.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class FileSystemStorageServiceImpl implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileSystemStorageServiceImpl.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    private final Map<String, PresignedUrlInfo> presignedUrls = new ConcurrentHashMap<>();

    private static class PresignedUrlInfo {
        String storageKey;
        String originalFileName;
        Instant expiry;
    }

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(uploadDir);
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage directory", e);
        }
    }

    @Override
    public String upload(String storageKey, InputStream inputStream, long contentLength, String contentType) {
        try {
            Path destinationFile = this.rootLocation.resolve(
                    Paths.get(storageKey))
                    .normalize().toAbsolutePath();
            
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath()) && !destinationFile.startsWith(this.rootLocation.toAbsolutePath())) {
                // To prevent directory traversal
                throw new StorageException("Cannot store file outside current directory.");
            }
            
            Files.createDirectories(destinationFile.getParent());
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored file locally: {}", storageKey);
            return storageKey;
        } catch (IOException e) {
            throw new StorageException("Failed to store file.", e);
        }
    }

    @Override
    public Resource download(String storageKey) {
        try {
            Path file = rootLocation.resolve(storageKey);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new StorageException("Could not read file: " + storageKey);
            }
        } catch (MalformedURLException e) {
            throw new StorageException("Could not read file: " + storageKey, e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Path file = rootLocation.resolve(storageKey);
            Files.deleteIfExists(file);
            logger.info("Deleted local file: {}", storageKey);
        } catch (IOException e) {
            logger.error("Failed to delete local file", e);
            throw new StorageException("Failed to delete local file: " + storageKey, e);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        Path file = rootLocation.resolve(storageKey);
        return Files.exists(file);
    }

    @Override
    public String generateDownloadUrl(String storageKey, String originalFileName) {
        String token = UUID.randomUUID().toString();
        PresignedUrlInfo info = new PresignedUrlInfo();
        info.storageKey = storageKey;
        info.originalFileName = originalFileName;
        info.expiry = Instant.now().plus(15, ChronoUnit.MINUTES);
        presignedUrls.put(token, info);

        return "http://localhost:8081/api/documents/local-download?token=" + token;
    }

    public Resource resolveLocalDownload(String token) {
        PresignedUrlInfo info = presignedUrls.get(token);
        if (info == null || Instant.now().isAfter(info.expiry)) {
            presignedUrls.remove(token);
            throw new StorageException("Invalid or expired download link.");
        }
        return download(info.storageKey);
    }

    public String resolveOriginalFileName(String token) {
        PresignedUrlInfo info = presignedUrls.get(token);
        return info != null ? info.originalFileName : "downloaded-file";
    }
}
