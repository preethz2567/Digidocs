package com.builds.digidocs.controller;

import com.builds.digidocs.dto.DocumentResponse;
import com.builds.digidocs.dto.RenameDocumentRequest;
import com.builds.digidocs.security.JwtService;
import com.builds.digidocs.service.DocumentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import com.builds.digidocs.dto.DocumentDownloadResponse;
import com.builds.digidocs.dto.ShareResponse;
import java.util.List;

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

    @GetMapping
    public List<DocumentResponse> getDocuments(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        return documentService.getDocuments(email);
    }

    @PostMapping("/upload")
    public DocumentResponse uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return documentService.uploadDocument(file, email);
    }

    @GetMapping("/{id}")
public ResponseEntity<Resource> downloadDocument(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authHeader) {

    String token = authHeader.substring(7);

    String email = jwtService.extractEmail(token);

    DocumentDownloadResponse response =
            documentService.downloadDocument(id, email);

    return ResponseEntity.ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" +
                            response.getOriginalFileName() + "\""
            )
            .body(response.getResource());
}

@DeleteMapping("/{id}")
public ResponseEntity<String> deleteDocument(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authHeader) {

    String token = authHeader.substring(7);

    String email = jwtService.extractEmail(token);

    documentService.deleteDocument(id, email);

    return ResponseEntity.ok("Document deleted successfully");
}


@GetMapping("/search")
public List<DocumentResponse> searchDocuments(
        @RequestParam String keyword,
        @RequestHeader("Authorization") String authHeader) {

    String token = authHeader.substring(7);

    String email = jwtService.extractEmail(token);

    return documentService.searchDocuments(email, keyword);
}

@PutMapping("/{id}")
public DocumentResponse renameDocument(
        @PathVariable Long id,
        @RequestBody RenameDocumentRequest request,
        @RequestHeader("Authorization") String authHeader) {

    String token = authHeader.substring(7);

    String email = jwtService.extractEmail(token);

    return documentService.renameDocument(
            id,
            email,
            request.getOriginalFileName()
    );
}

@GetMapping("/{id}/metadata")
public DocumentResponse getDocument(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authHeader) {

    String token = authHeader.substring(7);
    String email = jwtService.extractEmail(token);

    return documentService.getDocument(id, email);
}

@PostMapping("/{id}/share")
public ShareResponse shareDocument(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authHeader) {

    String token = authHeader.substring(7);

    String email = jwtService.extractEmail(token);

    return documentService.shareDocument(id, email);
}

}