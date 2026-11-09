package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.exception.ClienteJaCadastradoException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.ClienteServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.ClienteRepositoryPort;

import java.util.List;
import java.util.Optional;


public class ClienteService implements ClienteServicePort {

    private final ClienteRepositoryPort clienteRepository;

    public ClienteService(ClienteRepositoryPort clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    public Customer register(Customer cliente) {

        Optional<Customer> existente = clienteRepository.findByCnpj(cliente.getCnpj());
        if (existente.isPresent()) {
            throw new ClienteJaCadastradoException(cliente.getCnpj());
        }
        return clienteRepository.save(cliente);

    }

    @Override
    public List<Customer> listAll() {
        return clienteRepository.listAll();
    }


}
