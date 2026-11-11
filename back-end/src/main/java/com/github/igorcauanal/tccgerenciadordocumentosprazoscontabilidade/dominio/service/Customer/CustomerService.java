package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.AlreadyRegisteredCustomerException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Customer.CustomerServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Customer.CustomerRepositoryPort;

import java.util.List;
import java.util.Optional;


public class CustomerService implements CustomerServicePort {

    private final CustomerRepositoryPort clienteRepository;

    public CustomerService(CustomerRepositoryPort clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    public Customer register(Customer cliente) {

        Optional<Customer> existente = clienteRepository.findByCnpj(cliente.getCnpj());
        if (existente.isPresent()) {
            throw new AlreadyRegisteredCustomerException(cliente.getCnpj());
        }
        return clienteRepository.save(cliente);

    }

    @Override
    public List<Customer> listAll() {
        return clienteRepository.listAll();
    }


}
