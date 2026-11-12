package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.BusinessException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Request.RequestStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class Request {

    private Long id;
    private Long customerId;
    private String title;
    private String competence;
    private LocalDate deadline;
    private RequestStatus status;
    private LocalDateTime createdIn;
    private LocalDateTime completedIn;
    private LocalDateTime cancelledIn;
    private final List<ChecklistItem> checklist = new ArrayList<>();

    private Request() {
    }

    private Request(Long id,
                    Long customerId,
                    String title,
                    String competence,
                    LocalDate deadline,
                    LocalDateTime cancelledIn,
                    LocalDateTime completedIn,
                    LocalDateTime createdIn,
                    RequestStatus status) {
        this.id = id;
        this.customerId = customerId;
        this.title = title;
        this.competence = competence;
        this.deadline = deadline;
        this.cancelledIn = cancelledIn;
        this.completedIn = completedIn;
        this.createdIn = createdIn != null ? createdIn : LocalDateTime.now();
        this.status = status != null ? status : RequestStatus.ABERTA;
    }

    //Fábrica — cria uma NOVA solicitação. Valida todos os campos obrigatórios.
    public static Request create(Long customerId,
                                 String title,
                                 String competence,
                                 LocalDate deadline,
                                 LocalDateTime now) {
        requireNonNull(customerId, "Cliente é obrigatório");
        requireNonBlank(title, "Título é obrigatório");
        requireNonBlank(competence, "Competência é obrigatória");
        requireNonNull(now, "Data de criação é obrigatória");

        if (deadline == null) {
            throw new BusinessException("Prazo para envio é obrigatório");
        }
        if (deadline.isBefore(now.toLocalDate())) {
            throw new BusinessException("Prazo não pode ser no passado");
        }

        Request request = new Request();
        request.customerId = customerId;
        request.title = title;
        request.competence = competence;
        request.deadline = deadline;
        request.createdIn = now;
        request.status = RequestStatus.ABERTA;
        return request;
    }

    // usada apenas pelo mapper. Preserva o estado, sem validação.
    public static Request rebuild (Long id,
                                    Long customerId,
                                    String title,
                                    String competence,
                                    LocalDate deadline,
                                    LocalDateTime cancelledIn,
                                    LocalDateTime completedIn,
                                    LocalDateTime createdIn,
                                    RequestStatus status,
                                    List<ChecklistItem> checklist) {
        Request request = new Request(id, customerId, title, competence, deadline,
                cancelledIn, completedIn, createdIn, status);

        if (checklist != null) {
            request.checklist.addAll(checklist);
        }
        return request;
    }

    // Montagem do checklist  somente enquanto a solicitação estiver OPEN.
    public ChecklistItem addChecklistItem(String description, String expectedFileFormat) {
        if (status != RequestStatus.ABERTA) {
            throw new BusinessException("Checklist só pode ser montado com a solicitação em ABERTO");
        }

        ChecklistItem item = ChecklistItem.create(description, expectedFileFormat);
        this.checklist.add(item);
        return item;
    }

    // Progresso da conferência: aceitos total. Retorna 0.0000 – 1.0000
    public BigDecimal calculateProgress() {
        if (checklist.isEmpty()) {
            return BigDecimal.ZERO;
        }

        long accepted = checklist.stream()
                .filter(ChecklistItem::isAccepted)
                .count();

        return BigDecimal.valueOf(accepted)
                .divide(BigDecimal.valueOf(checklist.size()), 4, RoundingMode.HALF_UP);
    }

    public ChecklistItem findItem(Long itemId) {
        return checklist.stream()
                .filter(item -> Objects.equals(item.getId(), itemId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Item do checklist não encontrado: " + itemId));
    }

    // Só conclui quando TODOS os itens estiverem ACCEPTED.
    public void complete(LocalDateTime when) {
        if (status == RequestStatus.CONCLUIDA) {
            throw new BusinessException("Solicitação já está concluída");
        }
        if (status == RequestStatus.CANCELADA) {
            throw new BusinessException("Uma solicitação cancelada não pode ser concluída");
        }

        boolean allAccepted = !checklist.isEmpty()
                && checklist.stream().allMatch(ChecklistItem::isAccepted);

        if (!allAccepted) {
            throw new BusinessException(
                    "Solicitação só pode ser concluída quando todos os itens estiverem aceitos");
        }

        this.completedIn = when;
        this.status = RequestStatus.CONCLUIDA;
    }

    public void cancel(LocalDateTime when) {
        if (status == RequestStatus.CONCLUIDA) {
            throw new BusinessException("Uma solicitação concluída não pode ser cancelada");
        }
        if (status == RequestStatus.CANCELADA) {
            throw new BusinessException("Solicitação já está cancelada");
        }

        this.cancelledIn = when;
        this.status = RequestStatus.CANCELADA;
    }

    public boolean canBeAnswered() {
        return status == RequestStatus.ABERTA;
    }

    private static void requireNonNull(Object value, String message) {
        if (value == null) {
            throw new BusinessException(message);
        }
    }

    private static void requireNonBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BusinessException(message);
        }
    }



    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public String getTitle() { return title; }
    public String getCompetence() { return competence; }
    public LocalDate getDeadline() { return deadline; }
    public RequestStatus getStatus() { return status; }
    public LocalDateTime getCreatedIn() { return createdIn; }
    public LocalDateTime getCompletedIn() { return completedIn; }
    public LocalDateTime getCancelledIn() { return cancelledIn; }
    public List<ChecklistItem> getChecklist() { return List.copyOf(checklist); }



}
