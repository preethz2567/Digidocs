package com.builds.digidocs.dto;

import jakarta.validation.constraints.NotBlank;

public class RenameDocumentRequest {

    @NotBlank(message = "New file name is required")
    private String newName;

    public RenameDocumentRequest() {}

    public RenameDocumentRequest(String newName) {
        this.newName = newName;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }
}
