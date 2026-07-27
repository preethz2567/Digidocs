package com.builds.digidocs.dto;

import org.springframework.core.io.Resource;

public class DocumentDownloadResponse {

    private Resource resource;
    private String originalFileName;

    public DocumentDownloadResponse() {}

    public DocumentDownloadResponse(Resource resource, String originalFileName) {
        this.resource = resource;
        this.originalFileName = originalFileName;
    }

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource = resource;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }
}
