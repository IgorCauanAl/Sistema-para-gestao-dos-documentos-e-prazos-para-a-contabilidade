package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.deadline.DeadlineListItemReadModel;

import java.util.List;

public interface DeadlineQueryPort {

    List<DeadlineListItemReadModel> listAll();

    List<DeadlineListItemReadModel> listByCustomerId(Long customerId);
}
