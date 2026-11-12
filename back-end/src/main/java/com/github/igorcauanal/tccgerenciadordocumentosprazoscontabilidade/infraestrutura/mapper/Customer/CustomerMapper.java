package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.CustomerEntity;


public final class CustomerMapper {

    private CustomerMapper(){}

    public static CustomerEntity toEntity(Customer cliente){

        if(cliente == null ){
            return null;
        }

        CustomerEntity entity = new CustomerEntity();

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

    public static Customer toDomain(CustomerEntity entity){

        if(entity == null){
            return null;
        }

        return new Customer(
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
