package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.ClienteRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.ClienteMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.ClienteEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataClienteRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ClientePersistenceAdapter implements ClienteRepositoryPort {

    private final SpringDataClienteRepository clienteJpaRepository;


    @Override
    public Customer save (Customer cliente) {

        ClienteEntity entity = ClienteMapper.toEntity(cliente);
        ClienteEntity entitySalva = clienteJpaRepository.save(entity);
        return ClienteMapper.toDomain(entitySalva);

    }



    @Override
    public Optional<Customer> findByCnpj (String cnpj) {

        return clienteJpaRepository.findByCnpj(cnpj)
                .map(ClienteMapper::toDomain);

    }

    @Override
    public List<Customer> listAll() {
        return clienteJpaRepository.findAll()
                .stream()
                .map(ClienteMapper::toDomain)
                .toList();
    }
}
