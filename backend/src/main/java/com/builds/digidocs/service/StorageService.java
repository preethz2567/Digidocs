package com.builds.digidocs.service;

import org.springframework.core.io.Resource;
import java.io.InputStream;

public interface StorageService {
    
    /**
     * Uploads a file to the storage provider.
     * 
     * @param storageKey The unique identifier for the file (e.g., UUID + filename).
     * @param inputStream The input stream containing the file data.
     * @param contentLength The total size of the file in bytes.
     * @param contentType The MIME type of the file.
     * @return The resulting storage key (typically the same as provided).
     */
    String upload(String storageKey, InputStream inputStream, long contentLength, String contentType);

    /**
     * Downloads a file from the storage provider.
     * 
     * @param storageKey The unique identifier for the file.
     * @return A Resource representing the file data.
     */
    Resource download(String storageKey);

    /**
     * Deletes a file from the storage provider.
     * 
     * @param storageKey The unique identifier for the file.
     */
    void delete(String storageKey);

    /**
     * Checks if a file exists in the storage provider.
     * 
     * @param storageKey The unique identifier for the file.
     * @return true if it exists, false otherwise.
     */
    boolean exists(String storageKey);

    /**
     * Generates a short-lived download URL for direct browser downloading.
     * 
     * @param storageKey The unique identifier for the file.
     * @param originalFileName The original filename for Content-Disposition.
     * @return The presigned or local URL string.
     */
    String generateDownloadUrl(String storageKey, String originalFileName);
}
