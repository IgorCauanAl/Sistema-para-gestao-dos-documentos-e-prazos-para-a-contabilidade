package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.PrioridadePrazo;
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
    private PrioridadePrazo prioridade;
    private StatusDeadline status;
    private LocalDateTime criadoEm;
    private LocalDateTime entregueEm;
    private boolean atrasado;



    public static DeadlineResponseDTO deDominio(Deadline deadline, LocalDate dataAtual) {

        return new DeadlineResponseDTO(
                deadline.getId(),
                deadline.getClienteId(),
                deadline.getObrigacao(),
                deadline.getCategoria(),
                deadline.getCompetencia(),
                deadline.getDataVencimento(),
                deadline.getPrioridade(),
                deadline.getStatus(),
                deadline.getCriadoEm(),
                deadline.getEntregueEm(),
                deadline.isAtrasado(dataAtual)
        );


    }

}
