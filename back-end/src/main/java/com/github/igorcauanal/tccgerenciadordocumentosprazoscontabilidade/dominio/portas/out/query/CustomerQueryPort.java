package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.customer.CustomerListItemReadModel;

import java.util.List;

public interface CustomerQueryPort {

    List<CustomerListItemReadModel> listAll();
}
