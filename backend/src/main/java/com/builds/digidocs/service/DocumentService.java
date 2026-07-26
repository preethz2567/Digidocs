package com.builds.digidocs.service;

import com.builds.digidocs.dto.DocumentResponse;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import com.builds.digidocs.dto.DocumentDownloadResponse;

import java.util.List;

public interface DocumentService {

    DocumentResponse uploadDocument(MultipartFile file, String email);

    List<DocumentResponse> getDocuments(String email);
    DocumentDownloadResponse downloadDocument(Long id, String email);
    void deleteDocument(Long id, String email);
}