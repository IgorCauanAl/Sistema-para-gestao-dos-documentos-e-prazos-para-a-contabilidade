package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.TokenValidation;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.TokenValidationStatus;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.TokenServicePort;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SecurityFilterTest {

    private static final String EMAIL = "contador@contadash.com.br";

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldAuthenticateWithoutCreatingSessionWhenBearerTokenIsValid() throws Exception {
        TokenServicePort tokenService = mock(TokenServicePort.class);
        UserDetailsService userDetailsService = mock(UserDetailsService.class);
        when(tokenService.validate("token-valido")).thenReturn(TokenValidation.valid(EMAIL));
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(
                User.withUsername(EMAIL)
                        .password("hash")
                        .authorities(new SimpleGrantedAuthority("ROLE_CONTADOR"))
                        .build()
        );

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token-valido");

        new SecurityFilter(tokenService, userDetailsService)
                .doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_CONTADOR");
        assertThat(request.getSession(false)).isNull();
    }

    @Test
    void shouldNotAuthenticateWhenTokenIsInvalid() throws Exception {
        TokenServicePort tokenService = mock(TokenServicePort.class);
        UserDetailsService userDetailsService = mock(UserDetailsService.class);
        when(tokenService.validate("invalido")).thenReturn(TokenValidation.invalid());

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalido");

        new SecurityFilter(tokenService, userDetailsService)
                .doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(request.getSession(false)).isNull();
        assertThat(request.getAttribute(RestAuthenticationEntryPoint.AUTH_FAILURE_ATTRIBUTE))
                .isEqualTo(TokenValidationStatus.INVALID);
    }

    @Test
    void shouldExposeExpiredStatusWhenTokenIsExpired() throws Exception {
        TokenServicePort tokenService = mock(TokenServicePort.class);
        UserDetailsService userDetailsService = mock(UserDetailsService.class);
        when(tokenService.validate("expirado")).thenReturn(TokenValidation.expired());

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer expirado");

        new SecurityFilter(tokenService, userDetailsService)
                .doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(request.getAttribute(RestAuthenticationEntryPoint.AUTH_FAILURE_ATTRIBUTE))
                .isEqualTo(TokenValidationStatus.EXPIRED);
    }

    @Test
    void shouldIgnoreRequestsWithoutBearerToken() throws Exception {
        TokenServicePort tokenService = mock(TokenServicePort.class);
        UserDetailsService userDetailsService = mock(UserDetailsService.class);

        new SecurityFilter(tokenService, userDetailsService)
                .doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
