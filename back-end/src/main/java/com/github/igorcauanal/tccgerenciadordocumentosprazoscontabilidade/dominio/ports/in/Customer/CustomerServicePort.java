package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Customer.Customer;

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