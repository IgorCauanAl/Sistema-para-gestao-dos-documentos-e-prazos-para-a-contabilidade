package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.deadline;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.CurrentStage;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.DeadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;

import java.time.LocalDate;

public class DeadlineListItemReadModel {

    private Long id;
    private Long customerId;
    private String customerName;
    private String obligation;
    private String category;
    private String competence;
    private LocalDate dueDate;
    private DeadlinePriority priority;
    private CurrentStage currentStage;
    private StatusDeadline status;
    private boolean overdue;

    public DeadlineListItemReadModel(Long id,
                                     Long customerId,
                                     String customerName,
                                     String obligation,
                                     String category,
                                     String competence,
                                     LocalDate dueDate,
                                     DeadlinePriority priority,
                                     CurrentStage currentStage,
                                     StatusDeadline status,
                                     boolean overdue) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.obligation = obligation;
        this.category = category;
        this.competence = competence;
        this.dueDate = dueDate;
        this.priority = priority;
        this.currentStage = currentStage;
        this.status = status;
        this.overdue = overdue;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getObligation() {
        return obligation;
    }

    public String getCategory() {
        return category;
    }

    public String getCompetence() {
        return competence;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public DeadlinePriority getPriority() {
        return priority;
    }

    public CurrentStage getCurrentStage() {
        return currentStage;
    }

    public StatusDeadline getStatus() {
        return status;
    }

    public boolean isOverdue() {
        return overdue;
    }
}
