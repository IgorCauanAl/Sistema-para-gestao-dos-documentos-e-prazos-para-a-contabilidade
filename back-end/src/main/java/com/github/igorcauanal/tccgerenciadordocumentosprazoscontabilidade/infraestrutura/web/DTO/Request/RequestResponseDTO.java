package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.RequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class RequestResponseDTO {

    private Long id;
    private Long customerId;
    private String title;
    private String competence;
    private LocalDate deadline;
    private RequestStatus status;
    private LocalDateTime createdIn;
    private LocalDateTime completedIn;
    private LocalDateTime cancelledIn;

    /** Preenchido somente na resposta de criação da solicitação. */
    private String publicToken;

    /** Quantidade de itens aceitos na conferência. */
    private long acceptedItems;

    /** Quantidade total de itens do checklist. */
    private int totalItems;

    private BigDecimal progress;

    private List<ChecklistItemResponseDTO> checklist;

}
