package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenResponseDTO {

    private String token;
    private String tipo;
    private Long expiracao;

    public TokenResponseDTO() {
        this.tipo = "Bearer";
    }

    public TokenResponseDTO(String token, Long expiracao) {
        this.token = token;
        this.tipo = "Bearer";
        this.expiracao = expiracao;
    }



}
