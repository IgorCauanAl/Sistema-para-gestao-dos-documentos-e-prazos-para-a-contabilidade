package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer;

import java.util.List;

public interface ClienteServicePort {

    Customer register (Customer cliente);
    List<Customer> listAll ();
}
