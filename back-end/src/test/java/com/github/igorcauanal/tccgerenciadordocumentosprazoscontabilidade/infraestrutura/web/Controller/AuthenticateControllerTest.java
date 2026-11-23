package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Role.Role;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.TokenServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security.SecurityUserPrincipal;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.AutenticacaoRequestDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.AuthenticationResponseDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthenticateControllerTest {

    @Test
    void shouldReturnCompleteUserContextOnLogin() {
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        TokenServicePort tokenService = mock(TokenServicePort.class);
        Clock clock = Clock.fixed(Instant.parse("2026-11-23T12:34:56Z"), ZoneOffset.UTC);

        User user = new User(7L, "Marina", "marina@contadash.com.br", "hash", null);
        user.setRoles(Set.of(new Role(1L, "CONTADOR", "Contador")));
        SecurityUserPrincipal principal = new SecurityUserPrincipal(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities()
        );
        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authentication);
        when(tokenService.generateToken(user)).thenReturn("jwt-valido");

        AuthenticateController controller =
                new AuthenticateController(authenticationManager, tokenService, clock);
        ResponseEntity<AuthenticationResponseDTO> response = controller.login(
                new AutenticacaoRequestDTO("marina@contadash.com.br", "senha")
        );

        AuthenticationResponseDTO body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getName()).isEqualTo("Marina");
        assertThat(body.getEmail()).isEqualTo("marina@contadash.com.br");
        assertThat(body.getToken()).isEqualTo("jwt-valido");
        assertThat(body.getPerfil()).isEqualTo("Contador");
        assertThat(body.getDataReferencia()).isEqualTo("2026-11-23T12:34:56Z");
    }
}
