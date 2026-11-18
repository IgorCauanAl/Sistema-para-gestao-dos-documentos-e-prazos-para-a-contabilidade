package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.CustomerEntity;


public final class CustomerMapper {

    private CustomerMapper(){}

    public static CustomerEntity toEntity(Customer customer){

        if(customer == null ){
            return null;
        }

        CustomerEntity entity = new CustomerEntity();

        entity.setId(customer.getId());
        entity.setCnpj(customer.getCnpj());
        entity.setEmail(customer.getEmail());
        entity.setFullAddress(customer.getFullAddress());
        entity.setCorporateName(customer.getLegalName());
        entity.setResponsible(customer.getResponsibleName());
        entity.setPendingStatus(customer.getPendingStatus());
        entity.setLastPostedOn(customer.getLastSubmissionAt());

        return entity;
    }

    public static Customer toDomain(CustomerEntity entity){

        if(entity == null){
            return null;
        }

        return Customer.reconstitute(
                entity.getId(),
                entity.getCnpj(),
                entity.getCorporateName(),
                entity.getResponsible(),
                entity.getEmail(),
                entity.getFullAddress(),
                entity.getPendingStatus(),
                entity.getLastPostedOn()
        );

    }

}
