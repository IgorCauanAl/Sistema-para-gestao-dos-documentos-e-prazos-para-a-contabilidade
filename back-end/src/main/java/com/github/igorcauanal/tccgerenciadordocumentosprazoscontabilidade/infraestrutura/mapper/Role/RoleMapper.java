package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Role;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Role.Role;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.RoleEntity;

public final class RoleMapper {

    private RoleMapper() {
    }

    public static Role toDomain(RoleEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Role(entity.getId(), entity.getName(), entity.getDescription());
    }

    public static RoleEntity toReference(Role role) {
        if (role == null) {
            return null;
        }
        RoleEntity entity = new RoleEntity();
        entity.setId(role.getId());
        return entity;
    }

    public static RoleEntity toEntity(Role role) {
        if (role == null) {
            return null;
        }
        RoleEntity entity = new RoleEntity();
        entity.setId(role.getId());
        entity.setName(role.getName());
        entity.setDescription(role.getDescription());
        return entity;
    }
}