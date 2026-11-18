package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Customer.Customer;

import java.util.List;
import java.util.Optional;

public interface CustomerRepositoryPort {

    Customer save(Customer customer);

    Optional<Customer> findById(Long id);

    Optional<Customer> findByCnpj(String cnpj);

    List<Customer> listAll();

    void deleteById(Long id);
}