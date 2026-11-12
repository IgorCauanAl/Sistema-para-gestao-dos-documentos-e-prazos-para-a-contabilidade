package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;

import java.util.List;

public interface CustomerServicePort {

    Customer register(String cnpj,
                      String legalName,
                      String responsibleName,
                      String email,
                      String fullAddress);

    Customer update(Long id,
                    String legalName,
                    String responsibleName,
                    String email,
                    String fullAddress);

    void delete(Long id);

    List<Customer> listAll();

    Customer findById(Long id);
}