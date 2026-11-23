package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Role.Role;
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

import java.time.Clock;
import java.util.Comparator;
import java.util.Objects;

@RestController
@RequestMapping("/auth")
public class AuthenticateController {

    private final AuthenticationManager authenticationManager;
    private final TokenServicePort tokenService;
    private final Clock clock;

    public AuthenticateController(
            AuthenticationManager authenticationManager,
            TokenServicePort tokenService,
            Clock clock
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.clock = clock;
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
                token,
                perfilUsuario(principal),
                clock.instant().toString()
        ));
    }

    /**
     * Devolve o perfil legível do usuário autenticado para o topo da aplicação.
     * O login só aceita contadores, mas o rótulo vem do papel cadastrado.
     */
    private static String perfilUsuario(SecurityUserPrincipal principal) {
        return principal.getUser().getRoles().stream()
                .map(Role::getName)
                .filter(Objects::nonNull)
                .map(AuthenticateController::formatarPerfil)
                .filter(perfil -> !perfil.isBlank())
                .sorted(Comparator.naturalOrder())
                .findFirst()
                .orElse("Contador");
    }

    private static String formatarPerfil(String roleName) {
        String nome = roleName.startsWith("ROLE_") ? roleName.substring("ROLE_".length()) : roleName;
        if (nome.isBlank()) {
            return "";
        }
        return nome.substring(0, 1).toUpperCase() + nome.substring(1).toLowerCase();
    }
}
