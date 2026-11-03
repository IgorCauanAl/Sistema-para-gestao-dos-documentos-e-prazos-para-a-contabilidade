package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Cliente;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.ClienteRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.Entity.ClienteEntity;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class ClientePersistenceAdapter implements ClienteRepositoryPort {

    private final SpringDataClienteRepository clienteJpaRepository;


    @Override
    public Cliente salvar(Cliente cliente) {

        ClienteEntity entity = ClienteMapper.toEntity(cliente);
        ClienteEntity entitySalva = clienteJpaRepository.save(entity);
        return ClienteMapper.toDomain(entitySalva);

    }

    @Override
    public Optional<Cliente> buscarPorCnpj(String cnpj) {

        return clienteJpaRepository.buscarPorCnpj(cnpj)
                .map(ClienteMapper::toDomain);

    }

    @Override
    public List<Cliente> listarTodos() {
        return clienteJpaRepository.findAll()
                .stream()
                .map(ClienteMapper::toDomain)
                .toList();
    }
}
