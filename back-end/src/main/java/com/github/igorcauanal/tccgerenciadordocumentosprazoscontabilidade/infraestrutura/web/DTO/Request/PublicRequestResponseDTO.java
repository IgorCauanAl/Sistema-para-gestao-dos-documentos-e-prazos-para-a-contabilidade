package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO devolvido pelo portal público. Não expõe o token bruto e inclui a
 * razão social do cliente para que o Angular não precise consultar outro serviço.
 */
@Getter
@Setter
@NoArgsConstructor
public class PublicRequestResponseDTO extends RequestResponseDTO {

    private String customerName;
}
