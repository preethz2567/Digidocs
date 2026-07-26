package com.builds.digidocs.dto;


import org.springframework.core.io.Resource;

public class DocumentDownloadResponse {

    private final Resource resource;
    private final String originalFileName;

    public DocumentDownloadResponse(Resource resource, String originalFileName) {
        this.resource = resource;
        this.originalFileName = originalFileName;
    }

    public Resource getResource() {
        return resource;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }
}
