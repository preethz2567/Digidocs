package com.builds.digidocs.service;

import com.builds.digidocs.dto.DocumentResponse;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {

    DocumentResponse uploadDocument(MultipartFile file, String email);

}