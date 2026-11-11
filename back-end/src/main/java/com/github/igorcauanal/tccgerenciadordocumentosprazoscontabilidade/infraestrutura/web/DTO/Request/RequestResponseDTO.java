package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.RequestStatus;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class RequestResponseDTO {

    private Long id;
    private Long customerId;
    private  String title;
    private String competence;
    private LocalDate deadline;
    private RequestStatus requestStatus;
    private LocalDateTime createdIn;

}
