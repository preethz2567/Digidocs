package com.builds.digidocs.controller;

import com.builds.digidocs.dto.DocumentDownloadResponse;
import com.builds.digidocs.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/share")
public class ShareController {

    private final DocumentService documentService;

    public ShareController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/{shareToken}")
    public ResponseEntity<Resource> downloadSharedDocument(
            @PathVariable String shareToken) {

        DocumentDownloadResponse response =
                documentService.downloadSharedDocument(shareToken);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                response.getOriginalFileName() + "\""
                )
                .body(response.getResource());
    }
}