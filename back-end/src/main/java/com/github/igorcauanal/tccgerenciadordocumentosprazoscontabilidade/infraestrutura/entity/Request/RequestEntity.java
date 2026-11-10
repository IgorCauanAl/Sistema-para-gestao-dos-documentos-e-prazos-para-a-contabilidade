package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "request")
@Getter
@Setter
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
            LocalDateTime cancelledIn) {

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
        return entity;
    }







}
