package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Role.Role;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityUserPrincipalTest {

    @Test
    void shouldMapDomainUserToSpringSecurityPrincipal() {
        User user = new User(1L, "Marina", "contador@contadash.com.br", "hash", null);
        user.setRoles(Set.of(new Role(1L, "CONTADOR", "Contador")));

        SecurityUserPrincipal principal = new SecurityUserPrincipal(user);

        assertThat(principal.getUsername()).isEqualTo("contador@contadash.com.br");
        assertThat(principal.getPassword()).isEqualTo("hash");
        assertThat(principal.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_CONTADOR");
    }

    @Test
    void shouldKeepExistingRolePrefix() {
        User user = new User(1L, "Marina", "contador@contadash.com.br", "hash", null);
        user.setRoles(Set.of(new Role(1L, "ROLE_CONTADOR", "Contador")));

        SecurityUserPrincipal principal = new SecurityUserPrincipal(user);

        assertThat(principal.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_CONTADOR");
    }
}
