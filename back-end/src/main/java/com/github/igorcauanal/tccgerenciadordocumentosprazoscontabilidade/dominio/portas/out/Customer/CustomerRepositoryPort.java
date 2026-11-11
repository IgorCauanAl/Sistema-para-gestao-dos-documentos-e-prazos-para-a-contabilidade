package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;

import java.util.List;
import java.util.Optional;

public interface CustomerRepositoryPort {

    Customer save (Customer cliente);

    Optional<Customer> findByCnpj(String cnpj);

    List<Customer> listAll();

}
