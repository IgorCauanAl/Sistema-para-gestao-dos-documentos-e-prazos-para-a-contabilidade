package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.UsuarioRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.UsuarioEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.UsuarioMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataUsuarioRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@AllArgsConstructor
public class UsuarioPersistenceAdapter implements UsuarioRepositoryPort {

    private final SpringDataUsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;


    @Override
    public User save(User user) {
        UsuarioEntity entity = usuarioMapper.toEntity(user);
        UsuarioEntity entitySalva = usuarioRepository.save(entity);

        return usuarioMapper.toDomain(entitySalva);
    }

    @Override
    public Optional<User> findByid(Long id) {
        return usuarioRepository.findById(id)
                .map(usuarioMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuarioMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }
}
