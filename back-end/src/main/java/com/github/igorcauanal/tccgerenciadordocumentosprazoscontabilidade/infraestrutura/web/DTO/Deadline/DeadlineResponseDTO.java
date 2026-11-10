package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.deadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDeadline;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class DeadlineResponseDTO {

    private Long id;
    private Long clienteId;
    private String obrigacao;
    private String categoria;
    private String competencia;
    private LocalDate dataVencimento;
    private deadlinePriority prioridade;
    private StatusDeadline status;
    private LocalDateTime criadoEm;
    private LocalDateTime entregueEm;
    private boolean atrasado;



    public static DeadlineResponseDTO deDominio(Deadline deadline, LocalDate dataAtual) {

        return new DeadlineResponseDTO(
                deadline.getId(),
                deadline.getClienteId(),
                deadline.getObligation(),
                deadline.getCategory(),
                deadline.getCompetence(),
                deadline.getDueDate(),
                deadline.getPrioridade(),
                deadline.getStatus(),
                deadline.getCreateIn(),
                deadline.getDeliveredOn(),
                deadline.isLate(dataAtual)
        );


    }

}
