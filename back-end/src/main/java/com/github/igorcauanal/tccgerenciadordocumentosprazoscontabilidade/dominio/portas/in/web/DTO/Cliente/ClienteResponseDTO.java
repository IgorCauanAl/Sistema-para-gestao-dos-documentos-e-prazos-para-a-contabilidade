package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusPendenciaCliente;
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
    private StatusPendenciaCliente statusPendencia;
    private LocalDateTime ultimoEnvioEm;



}
