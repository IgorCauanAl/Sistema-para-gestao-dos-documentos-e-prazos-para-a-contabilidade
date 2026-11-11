package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.EmailNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidPasswordException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.User.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.AutenticacaoServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User.TokenResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.UserRepositoryPort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;


public class UsuarioService implements AutenticacaoServicePort {

    private final UserRepositoryPort userRepositoryPort;
    private final User user;

    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UsuarioService (UserRepositoryPort userRepositoryPort, User user){
        this.userRepositoryPort = userRepositoryPort;
        this.user = user;
    }

    @Override

    //Falta a implementação do JWT
    public TokenResponseDTO autenticar(String email, String senha) {

        Optional<User> emailUsuario = userRepositoryPort.findByEmail(email);

        if(emailUsuario == null){
            throw new EmailNotFoundException(email);
        }



        boolean senhaCorreta = encoder.matches(senha, user.getSenhaHash());

        if(senhaCorreta == false){
            throw new InvalidPasswordException();
        }


        return null;
    }
}
