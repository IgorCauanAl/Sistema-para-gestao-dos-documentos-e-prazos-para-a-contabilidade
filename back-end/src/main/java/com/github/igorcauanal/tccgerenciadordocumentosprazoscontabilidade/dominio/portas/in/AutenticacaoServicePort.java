package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO.Usuario.AutenticacaoRequestDTO;

public interface AutenticaçãoServicePort {

    public AutenticacaoRequestDTO autenticar(String email, String senha);

}
