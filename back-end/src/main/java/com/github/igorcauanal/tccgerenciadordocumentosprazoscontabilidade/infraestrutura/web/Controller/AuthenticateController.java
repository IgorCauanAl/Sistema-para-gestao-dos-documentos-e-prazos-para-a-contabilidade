package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.User.AuthenticatedUser;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.AuthenticateServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.AutenticacaoRequestDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.AuthenticationResponseDTO;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthenticateController {

    public static final String AUTHENTICATED_USER_SESSION_ATTRIBUTE = "authenticatedUser";

    private final AuthenticateServicePort autenticacaoServicePort;

    public AuthenticateController(AuthenticateServicePort autenticacaoServicePort) {
        this.autenticacaoServicePort = autenticacaoServicePort;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDTO> login(@Validated @RequestBody AutenticacaoRequestDTO request,
                                                           HttpSession session) {
        AuthenticatedUser authenticatedUser = autenticacaoServicePort.authenticate(request.getEmail(), request.getPassword());

        // Armazena o usuário autenticado na sessão para controle de acesso básico.
        session.setAttribute(AUTHENTICATED_USER_SESSION_ATTRIBUTE, authenticatedUser);

        AuthenticationResponseDTO response = new AuthenticationResponseDTO(
                authenticatedUser.getId(),
                authenticatedUser.getName(),
                authenticatedUser.getEmail()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        // Encerra a sessão do usuário autenticado.
        session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
