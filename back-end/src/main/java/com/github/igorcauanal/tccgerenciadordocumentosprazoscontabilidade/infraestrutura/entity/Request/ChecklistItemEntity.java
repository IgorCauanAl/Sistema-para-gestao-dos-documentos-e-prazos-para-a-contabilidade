package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.StatusCheckList;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@Table(name = "checklist_item")
public class ChecklistItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "formatFileExpected")
    private String formatFileExpected;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusCheckList status;

    @Column(name = "nameFileSent")
    private String nameFileSent;

    @Column(name = "uploaded_document_id")
    private Long uploadedDocumentId;

    @Column(name = "submitedOn")
    private LocalDateTime submitedOn;

    @Column(name = "revisedOn")
    private LocalDateTime revisedOn;

    @Column(name = "reasonRefusal")
    private String reasonRefusal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private RequestEntity request;

    // Setters
    public void setId(Long id)                              { this.id = id; }
    public void setDescription(String description)          { this.description = description; }
    public void setFormatFileExpected(String v)             { this.formatFileExpected = v; }
    public void setStatus(StatusCheckList status)       { this.status = status; }
    public void setNameFileSent(String nameFileSent)        { this.nameFileSent = nameFileSent; }
    public void setUploadedDocumentId(Long uploadedDocumentId) { this.uploadedDocumentId = uploadedDocumentId; }
    public void setSubmitedOn(LocalDateTime submitedOn)     { this.submitedOn = submitedOn; }
    public void setRevisedOn(LocalDateTime revisedOn)       { this.revisedOn = revisedOn; }
    public void setReasonRefusal(String reasonRefusal)      { this.reasonRefusal = reasonRefusal; }
    public void setRequest(RequestEntity request)           { this.request = request; }
}