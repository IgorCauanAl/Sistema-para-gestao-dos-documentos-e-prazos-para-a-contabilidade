package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.readmodel_adapter;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.customer.CustomerListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query.CustomerQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataCustomerRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CustomerQueryAdapter implements CustomerQueryPort {

    private final SpringDataCustomerRepository repository;

    public CustomerQueryAdapter(SpringDataCustomerRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<CustomerListItemReadModel> listAll() {
        return repository.listAllReadModels();
    }
}
