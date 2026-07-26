package com.builds.digidocs.service;

import com.builds.digidocs.dto.DocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {

    DocumentResponse uploadDocument(MultipartFile file, String email);

    List<DocumentResponse> getDocuments(String email);
}