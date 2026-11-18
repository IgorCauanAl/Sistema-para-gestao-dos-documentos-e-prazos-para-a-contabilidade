package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.customer.CustomerListItemReadModel;

import java.util.List;

public interface CustomerQueryPort {

    List<CustomerListItemReadModel> listAll();
}
