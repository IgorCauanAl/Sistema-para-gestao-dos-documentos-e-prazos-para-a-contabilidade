package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

import java.util.List;

@Getter
public class CreateRequestDTO {

    private Long customerId;
    private String title;
    private String competence;
    private LocalDate deadline;
    private List<ChecklistItemRequestDTO> checklist;

}
