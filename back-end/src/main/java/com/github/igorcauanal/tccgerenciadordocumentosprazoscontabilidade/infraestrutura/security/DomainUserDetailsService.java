package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.UserRepositoryPort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Adapter de infraestrutura que conecta o UserRepositoryPort (hexagonal) ao
 * UserDetailsService exigido pelo Spring Security.
 */
@Service
public class DomainUserDetailsService implements UserDetailsService {

    private final UserRepositoryPort userRepositoryPort;

    public DomainUserDetailsService(UserRepositoryPort userRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Credenciais inválidas"));

        return new SecurityUserPrincipal(user);
    }
}
