package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.customer.CustomerListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SpringDataCustomerRepository extends JpaRepository<CustomerEntity, Long> {


    Optional<CustomerEntity> findById(Long id);

    Optional<CustomerEntity> findByCnpj (String cnpj);

    CustomerEntity save (CustomerEntity entity);

    List<CustomerEntity> findAll();

    @Query("SELECT new com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.customer.CustomerListItemReadModel(" +
            "c.id, c.cnpj, c.corporateName, c.responsible, c.email, c.pendingStatus, c.lastPostedOn) " +
            "FROM CustomerEntity c " +
            "ORDER BY c.corporateName ASC")
    List<CustomerListItemReadModel> listAllReadModels();

    @Query("SELECT COUNT(c) FROM CustomerEntity c")
    long countAllCustomers();



}
