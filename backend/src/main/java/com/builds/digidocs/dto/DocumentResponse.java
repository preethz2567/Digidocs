package com.builds.digidocs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DocumentResponse {

    private Long id;

    private String originalFileName;

    private Long fileSize;

    private String contentType;

    private LocalDateTime uploadedAt;
}