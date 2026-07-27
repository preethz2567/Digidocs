package com.builds.digidocs.dto;

public class ShareResponse {

    private String shareToken;

    public ShareResponse() {
    }

    public ShareResponse(String shareToken) {
        this.shareToken = shareToken;
    }

    public String getShareToken() {
        return shareToken;
    }

    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }
}