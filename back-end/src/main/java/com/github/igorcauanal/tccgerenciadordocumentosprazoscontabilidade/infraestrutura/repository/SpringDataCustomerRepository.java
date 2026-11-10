package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpringDataClienteRepository extends JpaRepository<CustomerEntity, Long> {


    Optional<CustomerEntity> findById(Long id);

    Optional<CustomerEntity> findByCnpj (String cnpj);

    CustomerEntity save (CustomerEntity entity);

    List<CustomerEntity> findAll();



}
