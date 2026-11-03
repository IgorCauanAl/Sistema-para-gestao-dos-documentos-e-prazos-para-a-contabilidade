package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web;


import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class AutenticacaoController {

    public ResponseEntity<TokenResponseDTO> login(@Validated @RequestBody  LoginRequestDTO request)

}
