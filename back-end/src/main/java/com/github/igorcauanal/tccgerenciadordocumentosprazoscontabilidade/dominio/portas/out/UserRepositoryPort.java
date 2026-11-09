package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.User;

import java.util.Optional;

public interface UsuarioRepositoryPort {

    User save(User user);

    Optional<User> findById(Long id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail (String email);
}
