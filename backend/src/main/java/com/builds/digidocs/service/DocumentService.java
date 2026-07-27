package com.builds.digidocs.service;

import com.builds.digidocs.dto.DocumentResponse;
import com.builds.digidocs.dto.ShareResponse;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import com.builds.digidocs.dto.DocumentDownloadResponse;

import java.util.List;

public interface DocumentService {

    DocumentResponse uploadDocument(MultipartFile file, String email);

    List<DocumentResponse> getDocuments(String email);
    DocumentDownloadResponse downloadDocument(Long id, String email);
    void deleteDocument(Long id, String email);
    List<DocumentResponse> searchDocuments(String email, String keyword);
    DocumentResponse renameDocument(Long id, String email, String newName);
    DocumentResponse getDocument(Long id, String email);
    ShareResponse shareDocument(Long id, String email);
    DocumentDownloadResponse downloadSharedDocument(String shareToken);
}