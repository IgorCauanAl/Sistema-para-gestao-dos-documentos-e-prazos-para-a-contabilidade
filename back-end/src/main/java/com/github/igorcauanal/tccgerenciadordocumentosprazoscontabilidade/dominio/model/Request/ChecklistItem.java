package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.BusinessException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.StatusCheckList;

import java.time.LocalDateTime;

public class ChecklistItem {

        private Long id;
        private String description;
        private String formatFileExpected;
        private StatusCheckList status;
        private String nameFileSent;
        private Long uploadedDocumentId;
        private LocalDateTime submitedOn;
        private LocalDateTime revisedOn;
        private String reasonRefusal;

        private ChecklistItem() {}

    //Fábrica
    public static ChecklistItem rebuild(Long id,
                                        String description,
                                        String expectedFileFormat,
                                        StatusCheckList status,
                                        String nameFileSent,
                                        Long uploadedDocumentId,
                                        LocalDateTime submitedOn,
                                        LocalDateTime revisedOn,
                                        String reasonRefusal) {
        ChecklistItem item = new ChecklistItem();
        item.id = id;
        item.description = description;
        item.formatFileExpected = expectedFileFormat;
        item.status = status;
        item.nameFileSent = nameFileSent;
        item.uploadedDocumentId = uploadedDocumentId;
        item.submitedOn = submitedOn;
        item.revisedOn = revisedOn;
        item.reasonRefusal = reasonRefusal;
        return item;
    }

        public static ChecklistItem create(String description, String formatFileExpected) {
            if (description == null || description.isBlank()) {
                throw new BusinessException("Descrição é obrigatório");
            }
            if (formatFileExpected == null || formatFileExpected.isBlank()) {
                throw new BusinessException("O formato do arquivo é obrigatório");
            }
            ChecklistItem item = new ChecklistItem();
            item.description = description;
            item.formatFileExpected = formatFileExpected;
            item.status = StatusCheckList.PENDENTE;
            return item;
        }


        public void registerShipping(String nameArchive, Long uploadedDocumentId, LocalDateTime when) {
            if (nameArchive == null || nameArchive.isBlank()) {
                throw new BusinessException("Nome do arquivo é obrigatório");
            }
            if (uploadedDocumentId == null) {
                throw new BusinessException("Documento enviado é obrigatório");
            }
            if (status != StatusCheckList.PENDENTE && status != StatusCheckList.RECUSADO) {
                throw new BusinessException("Item não pode receber um novo upload no status: " + status);
            }
            this.nameFileSent = nameArchive;
            this.uploadedDocumentId = uploadedDocumentId;
            this.submitedOn = when;
            this.revisedOn = null;
            this.reasonRefusal = null;
            this.status = StatusCheckList.ENVIADO_PELO_CLIENTE;
        }

        public void accepterShipping(LocalDateTime when) {
            if (status != StatusCheckList.ENVIADO_PELO_CLIENTE) {
                throw new BusinessException("Apenas itens enviados pelo cliente podem ser aceitos");
            }
            this.revisedOn = when;
            this.status = status.ACEITO;
        }


        public void refuse(String reason, LocalDateTime when) {
            if (status != StatusCheckList.ENVIADO_PELO_CLIENTE) {
                throw new BusinessException("Apenas itens enviados pelo cliente podem ser rejeitados");
            }
            if (reason == null || reason.isBlank()) {
                throw new BusinessException("Motivo da rejeição é necessária");
            }
            this.reasonRefusal = reason;
            this.revisedOn = when;
            this.status = StatusCheckList.RECUSADO;
        }

        public boolean isAccepted()   { return status == StatusCheckList.ACEITO; }
        public boolean isPending() { return status == StatusCheckList.PENDENTE; }

        public Long getId() { return id; }
        public String getDescription() { return description; }
        public String getFormatFileExpected() { return formatFileExpected; }
        public StatusCheckList getStatus() { return status; }
        public String getNameFileSent() { return nameFileSent; }
        public Long getUploadedDocumentId() { return uploadedDocumentId; }
        public LocalDateTime getSubmitedOn() { return submitedOn; }
        public LocalDateTime getRevisedOn() { return revisedOn; }
        public String getReasonRefusal() { return reasonRefusal; }



    }

