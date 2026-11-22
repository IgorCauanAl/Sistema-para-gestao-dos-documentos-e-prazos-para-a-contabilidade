package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.RequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "request")
@Getter
@NoArgsConstructor
public class RequestEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "customer_id", nullable = false)
        private Long customerId;

        @Column(name = "title", nullable = false, length = 150)
        private String title;

        @Column(name = "competence", nullable = false, length = 7)
        private String competence;

        @Column(name = "deadline", nullable = false)
        private LocalDate deadline;

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 30)
        private RequestStatus status;

        @Column(name = "created_in", nullable = false)
        private LocalDateTime createdIn;

        @Column(name = "completed_in")
        private LocalDateTime completedIn;

        @Column(name = "cancelled_in")
        private LocalDateTime cancelledIn;

        @Column(name = "public_token_hash", length = 64, unique = true)
        private String publicTokenHash;

    @OneToMany(mappedBy = "request",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private List<ChecklistItemEntity> checklist = new ArrayList<>();

    public void addChecklistItem(ChecklistItemEntity item) {
        checklist.add(item);
        item.setRequest(this);
    }

    public void removeChecklistItem(ChecklistItemEntity item) {
        checklist.remove(item);
        item.setRequest(null);
    }

    public static RequestEntity rebuild (
            Long id,
            Long customerId,
            String title,
            String competence,
            LocalDate deadline,
            RequestStatus status,
            LocalDateTime createdIn,
            LocalDateTime completedIn,
            LocalDateTime cancelledIn,
            String publicTokenHash) {

        RequestEntity entity = new RequestEntity();
        entity.setId(id);
        entity.setCustomerId(customerId);
        entity.setTitle(title);
        entity.setCompetence(competence);
        entity.setDeadline(deadline);
        entity.setStatus(status);
        entity.setCreatedIn(createdIn);
        entity.setCompletedIn(completedIn);
        entity.setCancelledIn(cancelledIn);
        entity.setPublicTokenHash(publicTokenHash);
        return entity;
    }


    public void setId(Long id)                          { this.id = id; }
    public void setCustomerId(Long customerId)          { this.customerId = customerId; }
    public void setTitle(String title)                  { this.title = title; }
    public void setCompetence(String competence)        { this.competence = competence; }
    public void setDeadline(LocalDate deadline)         { this.deadline = deadline; }
    public void setStatus(RequestStatus status)         { this.status = status; }
    public void setCreatedIn(LocalDateTime createdIn)   { this.createdIn = createdIn; }
    public void setCompletedIn(LocalDateTime v)         { this.completedIn = v; }
    public void setCancelledIn(LocalDateTime v)         { this.cancelledIn = v; }
    public void setPublicTokenHash(String hash)         { this.publicTokenHash = hash; }







}
