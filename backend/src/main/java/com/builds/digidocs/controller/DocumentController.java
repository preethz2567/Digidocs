package com.builds.digidocs.controller;

import com.builds.digidocs.dto.DocumentResponse;
import com.builds.digidocs.security.JwtService;
import com.builds.digidocs.service.DocumentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final JwtService jwtService;

    public DocumentController(DocumentService documentService,
                              JwtService jwtService) {
        this.documentService = documentService;
        this.jwtService = jwtService;
    }

    @PostMapping("/upload")
    public DocumentResponse uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return documentService.uploadDocument(file, email);
    }
}