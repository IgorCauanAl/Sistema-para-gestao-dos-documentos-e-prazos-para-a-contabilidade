package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.TokenServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security.SecurityRoles;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security.SecurityUserPrincipal;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.AutenticacaoRequestDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.AuthenticationResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
public class AuthenticateController {

    private final AuthenticationManager authenticationManager;
    private final TokenServicePort tokenService;

    public AuthenticateController(
            AuthenticationManager authenticationManager,
            TokenServicePort tokenService
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponseDTO> login(
            @Valid @RequestBody AutenticacaoRequestDTO request
    ) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos");
        }

        boolean isContador = authentication.getAuthorities().stream()
                .anyMatch(authority -> SecurityRoles.ROLE_CONTADOR.equals(authority.getAuthority()));
        if (!isContador) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito ao contador");
        }

        SecurityUserPrincipal principal = (SecurityUserPrincipal) authentication.getPrincipal();

        String token = tokenService.generateToken(principal.getUser());

        return ResponseEntity.ok(new AuthenticationResponseDTO(
                principal.getId(),
                principal.getName(),
                principal.getEmail(),
                token
        ));
    }
}
