package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.deadline.DeadlineListItemReadModel;

import java.util.List;

public interface DeadlineQueryPort {

    List<DeadlineListItemReadModel> listAll();

    List<DeadlineListItemReadModel> listByCustomerId(Long customerId);
}
