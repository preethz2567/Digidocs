package com.builds.digidocs.service.impl;

import com.builds.digidocs.exception.StorageException;
import com.builds.digidocs.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.time.Duration;

@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "s3")
public class S3StorageServiceImpl implements StorageService {

    private static final Logger logger = LoggerFactory.getLogger(S3StorageServiceImpl.class);

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.region}")
    private String regionName;

    private S3Client s3Client;
    private S3Presigner s3Presigner;

    @PostConstruct
    public void init() {
        if (bucketName == null || bucketName.trim().isEmpty()) {
            throw new StorageException("AWS S3 bucket name is not configured.");
        }
        if (regionName == null || regionName.trim().isEmpty()) {
            throw new StorageException("AWS Region is not configured.");
        }
        
        Region region = Region.of(regionName);
        this.s3Client = S3Client.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
                
        this.s3Presigner = S3Presigner.builder()
                .region(region)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Override
    public String upload(String storageKey, InputStream inputStream, long contentLength, String contentType) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .contentType(contentType)
                    .contentLength(contentLength)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, contentLength));
            logger.info("Stored file in S3: {}", storageKey);
            return storageKey;
        } catch (S3Exception e) {
            logger.error("Failed to upload to S3", e);
            throw new StorageException("Failed to store file in S3: " + storageKey, e);
        }
    }

    @Override
    public Resource download(String storageKey) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();

            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest);
            return new InputStreamResource(s3Object);
        } catch (S3Exception e) {
            logger.error("Failed to download from S3", e);
            throw new StorageException("Could not read file from S3: " + storageKey, e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            logger.info("Deleted file from S3: {}", storageKey);
        } catch (S3Exception e) {
            logger.error("Failed to delete from S3", e);
            throw new StorageException("Failed to delete file from S3: " + storageKey, e);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                return false;
            }
            logger.error("Failed to check if file exists in S3", e);
            throw new StorageException("Failed to check existence in S3: " + storageKey, e);
        }
    }

    @Override
    public String generateDownloadUrl(String storageKey, String originalFileName) {
        try {
            String contentDisposition = "attachment; filename=\"" + originalFileName + "\"";
            
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(storageKey)
                    .responseContentDisposition(contentDisposition)
                    .build();

            GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedGetObjectRequest = s3Presigner.presignGetObject(getObjectPresignRequest);
            
            logger.info("Generated S3 presigned URL for key: {}", storageKey);
            return presignedGetObjectRequest.url().toString();
        } catch (Exception e) {
            logger.error("Failed to generate presigned URL for S3", e);
            throw new StorageException("Failed to generate presigned URL for S3: " + storageKey, e);
        }
    }
}
