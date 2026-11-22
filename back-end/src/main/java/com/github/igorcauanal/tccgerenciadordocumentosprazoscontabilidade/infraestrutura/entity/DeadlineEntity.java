package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.CurrentStage;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.DeadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@EntityListeners(AuditingEntityListener.class)
@Table(name = "deadline")
public class DeadlineEntity {

    //Fábrica
    public static DeadlineEntity reconstitute(
            Long id,
            Long customerId,
            String obligation,
            String category,
            String competence,
            LocalDate dueDate,
            DeadlinePriority priority,
            LocalDateTime createdAt,
            CurrentStage currentStage,
            StatusDeadline status,
            LocalDateTime deliveredOn,
            LocalDateTime updatedAt) {

        DeadlineEntity entity = new DeadlineEntity();
        entity.setId(id);
        entity.setCustomerId(customerId);
        entity.setObligation(obligation);
        entity.setCategory(category);
        entity.setCompetence(competence);
        entity.setDueDate(dueDate);
        entity.setPriority(priority);
        entity.setCreatedAt(createdAt);
        entity.setCurrentStage(currentStage);
        entity.setStatus(status);
        entity.setDeliveredOn(deliveredOn);
        entity.setUpdatedAt(updatedAt);
        return entity;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customerId", nullable = false)
    private Long customerId;

    @Column(name = "obligation", nullable = false, length = 255)
    private String obligation;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "competence", length = 7)
    private String competence;

    @Column(name = "dueDate", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private DeadlinePriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusDeadline status;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "delivered_on")
    private LocalDateTime deliveredOn;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", length = 50)
    private CurrentStage currentStage;

    @LastModifiedDate
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updatedAt;


    public void setCustomerId(Long customerId)                { this.customerId = customerId; }
    public void setObligation(String obligation)              { this.obligation = obligation; }
    public void setCategory(String category)                  { this.category = category; }
    public void setCompetence(String competence)              { this.competence = competence; }
    public void setDueDate(LocalDate dueDate)                 { this.dueDate = dueDate; }
    public void setPriority(DeadlinePriority priority)        { this.priority = priority; }
    public void setCurrentStage(CurrentStage currentStage)    { this.currentStage = currentStage; }

    // usados pela factory de reconstituição
    protected void setId(Long id)                             { this.id = id; }
    protected void setStatus(StatusDeadline status)           { this.status = status; }
    protected void setCreatedAt(LocalDateTime createdAt)      { this.createdAt = createdAt; }
    protected void setDeliveredOn(LocalDateTime deliveredOn)  { this.deliveredOn = deliveredOn; }
    protected void setUpdatedAt(LocalDateTime updatedAt)      { this.updatedAt = updatedAt; }
}