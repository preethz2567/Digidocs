package com.builds.digidocs.dto;

public class DocumentDownloadResponse {

    private String url;
    private String originalFileName;

    public DocumentDownloadResponse() {}

    public DocumentDownloadResponse(String url, String originalFileName) {
        this.url = url;
        this.originalFileName = originalFileName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }
}
