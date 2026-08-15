package com.builds.digidocs.dto;


import java.time.LocalDateTime;
import java.util.List;

public class DocumentResponse {

    private Long id;

    private String originalFileName;

    private Long fileSize;

    private String contentType;

    private LocalDateTime uploadedAt;

    private boolean isStarred;

    private List<TagDto> tags;

    public DocumentResponse(Long id, String originalFileName, Long fileSize, String contentType, LocalDateTime uploadedAt, boolean isStarred, List<TagDto> tags) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.uploadedAt = uploadedAt;
        this.isStarred = isStarred;
        this.tags = tags;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public boolean isStarred() {
        return isStarred;
    }

    public void setStarred(boolean starred) {
        isStarred = starred;
    }

    public List<TagDto> getTags() {
        return tags;
    }

    public void setTags(List<TagDto> tags) {
        this.tags = tags;
    }
}