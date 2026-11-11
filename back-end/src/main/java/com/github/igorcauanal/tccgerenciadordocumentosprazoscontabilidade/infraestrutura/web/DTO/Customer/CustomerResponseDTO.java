package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Customer;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Customer.PendingStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteResponseDTO {

    private Long id;
    private String cnpj;
    private String razaoSocial;
    private String responsavel;
    private String email;
    private String enderecoCompleto;
    private PendingStatus statusPendencia;
    private LocalDateTime ultimoEnvioEm;



}
