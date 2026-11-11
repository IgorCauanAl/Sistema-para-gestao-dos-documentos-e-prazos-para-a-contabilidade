package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class CreateRequestDTO {

    @NotNull(message = "O ID do cliente é obrigatório")
    private Long customerId;

    @NotBlank(message = "O título é obrigatório")
    @Size(min = 3, max = 100, message = "O título deve ter entre 3 e 100 caracteres")
    private String title;

    @NotBlank(message = "A competência é obrigatória")
    private String competence;

    @NotNull(message = "O prazo é obrigatório")
    @FutureOrPresent(message = "O prazo não pode ser uma data passada")
    private LocalDate deadline;

}
