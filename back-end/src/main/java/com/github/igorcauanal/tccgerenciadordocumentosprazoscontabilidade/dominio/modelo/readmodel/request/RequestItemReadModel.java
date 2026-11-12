package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Request.StatusCheckList;

import java.time.LocalDateTime;

public class RequestItemReadModel {

    private Long id;
    private String description;
    private String expectedFileFormat;
    private StatusCheckList status;
    private String uploadedFileName;
    private Long uploadedDocumentId;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;

    public RequestItemReadModel(Long id,
                                String description,
                                String expectedFileFormat,
                                StatusCheckList status,
                                String uploadedFileName,
                                Long uploadedDocumentId,
                                LocalDateTime submittedAt,
                                LocalDateTime reviewedAt,
                                String rejectionReason) {
        this.id = id;
        this.description = description;
        this.expectedFileFormat = expectedFileFormat;
        this.status = status;
        this.uploadedFileName = uploadedFileName;
        this.uploadedDocumentId = uploadedDocumentId;
        this.submittedAt = submittedAt;
        this.reviewedAt = reviewedAt;
        this.rejectionReason = rejectionReason;
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public String getExpectedFileFormat() {
        return expectedFileFormat;
    }

    public StatusCheckList getStatus() {
        return status;
    }

    public String getUploadedFileName() {
        return uploadedFileName;
    }

    public Long getUploadedDocumentId() {
        return uploadedDocumentId;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}
