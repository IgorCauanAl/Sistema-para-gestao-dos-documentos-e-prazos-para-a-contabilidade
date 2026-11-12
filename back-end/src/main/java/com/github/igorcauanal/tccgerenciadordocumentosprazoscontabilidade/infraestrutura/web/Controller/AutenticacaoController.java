package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.AutenticacaoRequestDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.TokenResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.User.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AutenticacaoController {

    private final UserService userService;

    public ResponseEntity<TokenResponseDTO> login(@Validated @RequestBody AutenticacaoRequestDTO request){

        userService.

    };

}
