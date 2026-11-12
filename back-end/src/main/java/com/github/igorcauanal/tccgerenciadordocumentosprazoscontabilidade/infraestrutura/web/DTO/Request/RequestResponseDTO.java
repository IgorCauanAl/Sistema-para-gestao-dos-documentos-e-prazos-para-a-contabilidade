package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Request.RequestStatus;
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

    private BigDecimal progress;

    private List<ChecklistItemResponseDTO> checklist;

}
