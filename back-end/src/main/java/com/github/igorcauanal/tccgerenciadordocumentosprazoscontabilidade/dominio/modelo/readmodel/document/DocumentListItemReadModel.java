package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.document;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.SendChannel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.StatusDocument;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DocumentListItemReadModel {

    private Long id;
    private Long customerId;
    private String documentType;
    private String competence;
    private LocalDate dueDate;
    private SendChannel sendChannel;
    private DocumentDirection direction;
    private StatusDocument status;
    private FileFormat fileFormat;
    private String fileName;
    private LocalDateTime createdAt;

    public DocumentListItemReadModel(Long id,
                                     Long customerId,
                                     String documentType,
                                     String competence,
                                     LocalDate dueDate,
                                     SendChannel sendChannel,
                                     DocumentDirection direction,
                                     StatusDocument status,
                                     FileFormat fileFormat,
                                     String fileName,
                                     LocalDateTime createdAt) {
        this.id = id;
        this.customerId = customerId;
        this.documentType = documentType;
        this.competence = competence;
        this.dueDate = dueDate;
        this.sendChannel = sendChannel;
        this.direction = direction;
        this.status = status;
        this.fileFormat = fileFormat;
        this.fileName = fileName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public String getCompetence() {
        return competence;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public SendChannel getSendChannel() {
        return sendChannel;
    }

    public DocumentDirection getDirection() {
        return direction;
    }

    public StatusDocument getStatus() {
        return status;
    }

    public FileFormat getFileFormat() {
        return fileFormat;
    }

    public String getFileName() {
        return fileName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
