package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.RequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RequestListItemReadModel {

    private Long id;
    private Long customerId;
    private String title;
    private String competence;
    private LocalDate dueDate;
    private RequestStatus status;
    private long acceptedItems;
    private int totalItems;
    private BigDecimal progress;

    public RequestListItemReadModel(Long id,
                                    Long customerId,
                                    String title,
                                    String competence,
                                    LocalDate dueDate,
                                    RequestStatus status,
                                    long acceptedItems,
                                    int totalItems,
                                    BigDecimal progress) {
        this.id = id;
        this.customerId = customerId;
        this.title = title;
        this.competence = competence;
        this.dueDate = dueDate;
        this.status = status;
        this.acceptedItems = acceptedItems;
        this.totalItems = totalItems;
        this.progress = progress;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getTitle() {
        return title;
    }

    public String getCompetence() {
        return competence;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public long getAcceptedItems() {
        return acceptedItems;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public BigDecimal getProgress() {
        return progress;
    }
}
