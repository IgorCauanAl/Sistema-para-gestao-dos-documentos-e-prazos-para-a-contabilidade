package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.Controller;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO.Usuario.AutenticacaoRequestDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO.Usuario.TokenResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AutenticacaoController {

    private final UsuarioService usuarioService;

    public ResponseEntity<TokenResponseDTO> login(@Validated @RequestBody AutenticacaoRequestDTO request){

        usuarioService.

    };

}
