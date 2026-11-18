package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Customer.PendingStatus;

import java.time.LocalDateTime;

public class CustomerListItemReadModel {

    private Long id;
    private String cnpj;
    private String legalName;
    private String responsibleName;
    private String email;
    private PendingStatus pendingStatus;
    private LocalDateTime lastSubmissionAt;

    public CustomerListItemReadModel(Long id,
                                     String cnpj,
                                     String legalName,
                                     String responsibleName,
                                     String email,
                                     PendingStatus pendingStatus,
                                     LocalDateTime lastSubmissionAt) {
        this.id = id;
        this.cnpj = cnpj;
        this.legalName = legalName;
        this.responsibleName = responsibleName;
        this.email = email;
        this.pendingStatus = pendingStatus;
        this.lastSubmissionAt = lastSubmissionAt;
    }

    public Long getId() {
        return id;
    }

    public String getCnpj() {
        return cnpj;
    }

    public String getLegalName() {
        return legalName;
    }

    public String getResponsibleName() {
        return responsibleName;
    }

    public String getEmail() {
        return email;
    }

    public PendingStatus getPendingStatus() {
        return pendingStatus;
    }

    public LocalDateTime getLastSubmissionAt() {
        return lastSubmissionAt;
    }
}
