package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Cliente;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.Entity.ClienteEntity;
import org.springframework.stereotype.Component;

@Component
public final class ClienteMapper {

    private ClienteMapper(){}

    public static ClienteEntity toEntity(Cliente cliente){

        if(cliente == null ){
            return null;
        }

        ClienteEntity entity = new ClienteEntity();

        entity.setId(cliente.getId());
        entity.setCnpj(cliente.getCnpj());
        entity.setEmail(cliente.getEmail());
        entity.setEnderecoCompleto(cliente.getEnderecoCompleto());
        entity.setRazaoSocial(cliente.getRazaoSocial());
        entity.setResponsavel(cliente.getResponsavel());
        entity.setStatusPendencia(cliente.getStatusPendencia());
        entity.setUltimoEnvioEm(cliente.getUltimoEnvioEm());


        return entity;
    }

    public static Cliente toDomain(ClienteEntity entity){

        if(entity == null){
            return null;
        }

        return new Cliente(
                entity.getId(),
                entity.getCnpj(),
                entity.getRazaoSocial(),
                entity.getResponsavel(),
                entity.getEmail(),
                entity.getEnderecoCompleto(),
                entity.getStatusPendencia(),
                entity.getUltimoEnvioEm()
        );

    }

}
