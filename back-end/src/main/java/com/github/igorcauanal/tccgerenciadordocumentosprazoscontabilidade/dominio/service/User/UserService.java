package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.User;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.EmailNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidPasswordException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.AuthenticatedUser;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.AuthenticateServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.PasswordEncoderPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.UserRepositoryPort;

public class UserService implements AuthenticateServicePort {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoderPort passwordEncoderPort;

    public UserService(UserRepositoryPort userRepositoryPort, PasswordEncoderPort passwordEncoderPort) {
        this.userRepositoryPort = userRepositoryPort;
        this.passwordEncoderPort = passwordEncoderPort;
    }

    @Override
    public AuthenticatedUser authenticate(String email, String password) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new EmailNotFoundException(email));

        boolean passwordMatches = passwordEncoderPort.matches(password, user.getPasswordHash());
        if (!passwordMatches) {
            // Senha inválida para o e-mail informado.
            throw new InvalidPasswordException();
        }

        return new AuthenticatedUser(user.getId(), user.getName(), user.getEmail());
    }
}
