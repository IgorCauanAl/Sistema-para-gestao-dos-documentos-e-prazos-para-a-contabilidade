package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Customer.CustomerRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Customer.CustomerMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.CustomerEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataCustomerRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class CustomerPersistenceAdapter implements CustomerRepositoryPort {

    private final SpringDataCustomerRepository clienteJpaRepository;


    @Override
    public Customer save (Customer cliente) {

        CustomerEntity entity = CustomerMapper.toEntity(cliente);
        CustomerEntity entitySalva = clienteJpaRepository.save(entity);
        return CustomerMapper.toDomain(entitySalva);

    }



    @Override
    public Optional<Customer> findByCnpj (String cnpj) {

        return clienteJpaRepository.findByCnpj(cnpj)
                .map(CustomerMapper::toDomain);

    }

    @Override
    public List<Customer> listAll() {
        return clienteJpaRepository.findAll()
                .stream()
                .map(CustomerMapper::toDomain)
                .toList();
    }
}
