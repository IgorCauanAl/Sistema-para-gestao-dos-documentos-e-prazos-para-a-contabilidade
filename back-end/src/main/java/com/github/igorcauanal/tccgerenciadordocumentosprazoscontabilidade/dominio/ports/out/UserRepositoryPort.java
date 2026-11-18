package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;

import java.util.Optional;

public interface UserRepositoryPort {

    User save(User user);

    Optional<User> findById(Long id);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
