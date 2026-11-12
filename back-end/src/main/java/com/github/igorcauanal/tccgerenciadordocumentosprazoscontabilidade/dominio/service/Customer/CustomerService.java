package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.AlreadyRegisteredCustomerException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.CustomerNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Customer.CustomerServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Customer.CustomerRepositoryPort;

import java.util.List;

public class CustomerService implements CustomerServicePort {

    private final CustomerRepositoryPort customerRepository;

    public CustomerService(CustomerRepositoryPort customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public Customer register(String cnpj,
                             String legalName,
                             String responsibleName,
                             String email,
                             String fullAddress) {

        customerRepository.findByCnpj(cnpj).ifPresent(existing -> {
            throw new AlreadyRegisteredCustomerException(cnpj);
        });

        Customer customer = Customer.create(cnpj, legalName, responsibleName, email, fullAddress);
        return customerRepository.save(customer);
    }

    @Override
    public Customer update(Long id,
                           String legalName,
                           String responsibleName,
                           String email,
                           String fullAddress) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));

        customer.update(legalName, responsibleName, email, fullAddress);
        return customerRepository.save(customer);
    }

    @Override
    public void delete(Long id) {
        customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));

        customerRepository.deleteById(id);
    }

    @Override
    public List<Customer> listAll() {
        return customerRepository.listAll();
    }

    @Override
    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }
}