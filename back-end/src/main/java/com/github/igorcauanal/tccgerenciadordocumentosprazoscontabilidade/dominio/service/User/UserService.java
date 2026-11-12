package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.User;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.EmailNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidPasswordException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.User.AuthenticatedUser;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.User.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.AuthenticateServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.UserRepositoryPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements AuthenticateServicePort {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepositoryPort userRepositoryPort, PasswordEncoder passwordEncoder) {
        this.userRepositoryPort = userRepositoryPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthenticatedUser authenticate(String email, String password) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException(email));

        boolean passwordMatches = passwordEncoder.matches(password, user.getPasswordHash());
        if (!passwordMatches) {
            // Senha inválida para o e-mail informado.
            throw new InvalidPasswordException();
        }

        return new AuthenticatedUser(user.getId(), user.getName(), user.getEmail());
    }
}
