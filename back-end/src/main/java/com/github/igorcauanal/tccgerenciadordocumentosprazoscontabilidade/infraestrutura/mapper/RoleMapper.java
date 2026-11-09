package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Role;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.RoleEntity;


public final class PerfilMapper {

    public static Role toDomain(RoleEntity e) {
        if (e == null) {
            return null;
        }
        return new Role(e.getId(), e.getNome(), e.getDescricao());
    }


    public static RoleEntity toReference(Role p) {
        if (p == null) {
            return null;
        }
        RoleEntity e = new RoleEntity();
        e.setId(p.getId());
        return e;
    }


    public static RoleEntity toEntity(Role p) {
        if (p == null) {
            return null;
        }
        RoleEntity e = new RoleEntity();
        e.setId(p.getId());
        e.setNome(p.getNome());
        e.setDescricao(p.getDescricao());
        return e;
    }
}