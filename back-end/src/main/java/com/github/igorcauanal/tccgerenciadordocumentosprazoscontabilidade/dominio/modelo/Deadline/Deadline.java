package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Deadline.CurrentStage;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Deadline.DeadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Deadline.StatusDeadline;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class Deadline {

    private Long id;
    private final Long customerId;
    private final String obligation;
    private final String category;
    private final String competence;
    private final LocalDate dueDate;
    private final DeadlinePriority priority;
    private final LocalDateTime createdAt;
    private StatusDeadline status;
    private CurrentStage currentStage;
    private LocalDateTime deliveredOn;

    private Deadline(Long id,
                     Long customerId,
                     String obligation,
                     String category,
                     String competence,
                     LocalDate dueDate,
                     DeadlinePriority priority,
                     LocalDateTime createdAt,
                     StatusDeadline status,
                     CurrentStage currentStage,
                     LocalDateTime deliveredOn) {

        this.id = id;
        this.customerId = requireNonNull(customerId, "Cliente é obrigatório");
        this.obligation = requireNonBlank(obligation, "Obrigação é obrigatória");
        this.category = requireNonBlank(category, "Categoria é obrigatória");
        this.competence = requireNonBlank(competence, "Competência é obrigatória");
        this.dueDate = requireNonNull(dueDate, "Vencimento é obrigatório");
        this.priority = requireNonNull(priority, "Prioridade é obrigatória");
        this.createdAt = requireNonNull(createdAt, "Data de criação é obrigatória");
        this.status = requireNonNull(status, "Status é obrigatório");
        this.currentStage = requireNonNull(currentStage, "Etapa atual é obrigatória");
        this.deliveredOn = deliveredOn;

        if (status == StatusDeadline.CONCLUIDO && deliveredOn == null) {
            throw new IllegalArgumentException("Prazo concluído deve ter data de entrega");
        }
        if (status != StatusDeadline.CONCLUIDO && deliveredOn != null) {
            throw new IllegalArgumentException("Prazo não concluído não deve ter data de entrega");
        }
    }

    // Cria um novo prazo. Sempre nasce como PENDENTE, sem id e sem data de entrega.
    public static Deadline create(Long customerId,
                                  String obligation,
                                  String category,
                                  String competence,
                                  LocalDate dueDate,
                                  DeadlinePriority priority,
                                  CurrentStage currentStage) {
        return new Deadline(
                null, customerId, obligation, category, competence,
                dueDate, priority, LocalDateTime.now(),
                StatusDeadline.PENDENTE, currentStage, null
        );
    }

    // Reconstitui um prazo vindo da persistência.
    public static Deadline reconstitute(Long id,
                                        Long customerId,
                                        String obligation,
                                        String category,
                                        String competence,
                                        LocalDate dueDate,
                                        DeadlinePriority priority,
                                        LocalDateTime createdAt,
                                        CurrentStage currentStage,
                                        StatusDeadline status,
                                        LocalDateTime deliveredOn) {
        return new Deadline(
                id, customerId, obligation, category, competence,
                dueDate, priority, createdAt, status, currentStage, deliveredOn
        );
    }

    // Marca o prazo como entregue. A confirmação ("tem certeza?") deve ocorrer
    // na UI/controller ANTES de chamar o caso de uso que invoca este método.
    public void markAsDelivered(LocalDateTime deliveredAt) {
        if (deliveredAt == null) {
            throw new IllegalArgumentException("Data de entrega é obrigatória");
        }
        if (status == StatusDeadline.CONCLUIDO) {
            throw new IllegalStateException("Prazo já está concluído");
        }
        if (status == StatusDeadline.CANCELADO) {
            throw new IllegalStateException("Prazo cancelado não pode ser concluído");
        }
        if (deliveredAt.isBefore(createdAt)) {
            throw new IllegalArgumentException("Data de entrega não pode ser anterior à criação");
        }
        this.deliveredOn = deliveredAt;
        this.status = StatusDeadline.CONCLUIDO;
        this.currentStage = CurrentStage.CONCLUIDO; // se o enum CurrentStage tiver esse valor
    }

    // Move a etapa atual. Prazo concluído ou cancelado não pode mudar de etapa.
    public void moveToStage(CurrentStage newStage) {
        if (newStage == null) {
            throw new IllegalArgumentException("Nova etapa é obrigatória");
        }
        if (status == StatusDeadline.CONCLUIDO) {
            throw new IllegalStateException("Prazo concluído não pode mudar de etapa");
        }
        if (status == StatusDeadline.CANCELADO) {
            throw new IllegalStateException("Prazo cancelado não pode mudar de etapa");
        }
        this.currentStage = newStage;
    }

    public void cancel() {
        if (status == StatusDeadline.CONCLUIDO) {
            throw new IllegalStateException("Prazo concluído não pode ser cancelado");
        }
        if (status == StatusDeadline.CANCELADO) {
            throw new IllegalStateException("Prazo já está cancelado");
        }
        this.status = StatusDeadline.CANCELADO;
    }

    public boolean isCompleted() {
        return this.status == StatusDeadline.CONCLUIDO;
    }

    public boolean isLate(LocalDate referenceDate) {
        if (referenceDate == null) {
            throw new IllegalArgumentException("Data de referência é obrigatória");
        }
        if (isCompleted()) {
            return false;
        }
        return referenceDate.isAfter(this.dueDate);
    }

    public void assignId(Long id) {
        if (this.id != null) {
            throw new IllegalStateException("Id já foi atribuído");
        }
        if (id == null) {
            throw new IllegalArgumentException("Id é obrigatório");
        }
        this.id = id;
    }

    public Long getId()               { return id; }
    public Long getCustomerId()       { return customerId; }
    public String getObligation()     { return obligation; }
    public String getCategory()       { return category; }
    public String getCompetence()     { return competence; }
    public LocalDate getDueDate()     { return dueDate; }
    public DeadlinePriority getPriority()          { return priority; }
    public StatusDeadline getStatus()              { return status; }
    public CurrentStage getCurrentStage()          { return currentStage; }
    public LocalDateTime getCreatedAt()            { return createdAt; }
    public LocalDateTime getDeliveredOn()          { return deliveredOn; }

    // Mantido como alias de getStatus() para não quebrar chamadas existentes.
    public StatusDeadline getStatusDeadline()      { return status; }

    private static <T> T requireNonNull(T value, String message) {
        if (value == null) throw new IllegalArgumentException(message);
        return value;
    }

    private static String requireNonBlank(String value, String message) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(message);
        return value;
    }
}