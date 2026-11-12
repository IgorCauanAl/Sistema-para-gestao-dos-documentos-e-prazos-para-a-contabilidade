package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.TokenResponseDTO;

public interface AutenticacaoServicePort {

    TokenResponseDTO autenticar(String email, String senha);

}
