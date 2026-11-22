package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.RequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class RequestReadModel {

    private Long id;
    private Long customerId;
    private String title;
    private String competence;
    private LocalDate dueDate;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private LocalDateTime canceledAt;
    private long acceptedItems;
    private int totalItems;
    private BigDecimal progress;
    private List<RequestItemReadModel> items;

    public RequestReadModel(Long id,
                            Long customerId,
                            String title,
                            String competence,
                            LocalDate dueDate,
                            RequestStatus status,
                            LocalDateTime createdAt,
                            LocalDateTime completedAt,
                            LocalDateTime canceledAt,
                            long acceptedItems,
                            int totalItems,
                            BigDecimal progress,
                            List<RequestItemReadModel> items) {
        this.id = id;
        this.customerId = customerId;
        this.title = title;
        this.competence = competence;
        this.dueDate = dueDate;
        this.status = status;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.canceledAt = canceledAt;
        this.acceptedItems = acceptedItems;
        this.totalItems = totalItems;
        this.progress = progress;
        this.items = items;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public LocalDateTime getCanceledAt() {
        return canceledAt;
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

    public List<RequestItemReadModel> getItems() {
        return items;
    }
}
