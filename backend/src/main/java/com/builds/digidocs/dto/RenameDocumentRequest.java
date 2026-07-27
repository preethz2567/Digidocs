package com.builds.digidocs.dto;

public class RenameDocumentRequest {

    private String originalFileName;

    public RenameDocumentRequest() {
    }

    public RenameDocumentRequest(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }
}
