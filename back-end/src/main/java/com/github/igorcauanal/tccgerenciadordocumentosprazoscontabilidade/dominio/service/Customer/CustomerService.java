package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.AlreadyRegisteredCustomerException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.CustomerNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Customer.CustomerServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Customer.CustomerRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util.CnpjFormatter;

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

        String formattedCnpj = CnpjFormatter.format(cnpj);

        // Consulta também a forma crua para não duplicar registros legados gravados sem máscara.
        customerRepository.findByCnpj(formattedCnpj)
                .or(() -> customerRepository.findByCnpj(cnpj))
                .ifPresent(existing -> {
                    throw new AlreadyRegisteredCustomerException(formattedCnpj);
                });

        Customer customer = Customer.create(formattedCnpj, legalName, responsibleName, email, fullAddress);
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
