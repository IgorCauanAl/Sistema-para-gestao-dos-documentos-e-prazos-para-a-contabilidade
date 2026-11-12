package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataUsuarioRepository extends JpaRepository<Long, UserEntity> {


    UserEntity save (UserEntity usuario);


    Optional<UserEntity> findById(Long id);

    Optional<UserEntity> findByEmail (String email);

    boolean existsByEmail (String email);
}
