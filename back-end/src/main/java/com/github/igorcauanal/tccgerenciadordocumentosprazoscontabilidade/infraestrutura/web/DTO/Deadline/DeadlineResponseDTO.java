package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.dto.deadline;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.CurrentStage;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.DeadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DeadlineResponseDTO {

    private Long id;
    private Long customerId;
    private String customerName;
    private String category;
    private String competence;
    private LocalDate dueDate;
    private DeadlinePriority priority;
    private CurrentStage currentStage;
    private StatusDeadline status;
    private boolean late;

    public static DeadlineResponseDTO fromDomain(Deadline deadline,
                                                 String customerName,
                                                 LocalDate referenceDate) {
        return new DeadlineResponseDTO(
                deadline.getId(),
                deadline.getCustomerId(),
                customerName,
                deadline.getCategory(),
                deadline.getCompetence(),
                deadline.getDueDate(),
                deadline.getPriority(),
                deadline.getCurrentStage(),
                deadline.getStatus(),
                deadline.isLate(referenceDate)
        );
    }
}