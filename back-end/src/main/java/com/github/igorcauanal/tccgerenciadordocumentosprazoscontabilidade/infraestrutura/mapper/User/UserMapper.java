package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Role.Role;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.User.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.RoleEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.UserEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Role.RoleMapper;
import lombok.AllArgsConstructor;

import java.util.HashSet;
import java.util.Set;


@AllArgsConstructor
public final class UserMapper {

    private final RoleMapper roleMapper;


    public static User toDomain(UserEntity entity){

        if (entity == null){
            return null;
        }

        User user = new User(
                entity.getId(),
                entity.getNome(),
                entity.getEmail(),
                entity.getSenhaHash(),
                entity.getCriadoEm()
        );

        Set<Role> perfis = new HashSet<>();
        for (RoleEntity pe : entity.getPerfis()) {
            perfis.add(roleMapper.toDomain(pe));
        }
        user.setPerfis(perfis);

        return user;

    }


    public static UserEntity toEntity(User user){

        if(user == null){
            return null;
        }

        UserEntity entity = new UserEntity();

        entity.setId(user.getId());
        entity.setNome(user.getNome());
        entity.setCriadoEm(user.getCriadoEm());
        entity.setEmail(user.getEmail());

        Set<RoleEntity> perfisEntity = new HashSet<>();
        for(Role p : user.getPerfis()){
            perfisEntity.add(roleMapper.toReference(p));
        }

        entity.setPerfis(perfisEntity);

        return entity;

    }



}
