package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;

import java.util.List;

public interface CustomerServicePort {

    Customer register (Customer cliente);
    List<Customer> listAll ();
}
