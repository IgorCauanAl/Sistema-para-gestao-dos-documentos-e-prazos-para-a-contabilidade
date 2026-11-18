package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.User;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Role.Role;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.RoleEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.UserEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Role.RoleMapper;

import java.util.HashSet;
import java.util.Set;

public final class UserMapper {

    private UserMapper() {
    }

    public static User toDomain(UserEntity entity) {
        if (entity == null) {
            return null;
        }

        User user = new User(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getCreatedAt()
        );

        Set<Role> roles = new HashSet<>();
        if (entity.getProfiles() != null) {
            for (RoleEntity roleEntity : entity.getProfiles()) {
                roles.add(RoleMapper.toDomain(roleEntity));
            }
        }
        user.setRoles(roles);

        return user;
    }

    public static UserEntity toEntity(User user) {
        if (user == null) {
            return null;
        }

        UserEntity entity = new UserEntity();
        entity.setId(user.getId());
        entity.setName(user.getName());
        entity.setEmail(user.getEmail());
        entity.setPasswordHash(user.getPasswordHash());
        entity.setCreatedAt(user.getCreatedAt());

        Set<RoleEntity> profiles = new HashSet<>();
        if (user.getRoles() != null) {
            for (Role role : user.getRoles()) {
                profiles.add(RoleMapper.toReference(role));
            }
        }
        entity.setProfiles(profiles);

        return entity;
    }
}
