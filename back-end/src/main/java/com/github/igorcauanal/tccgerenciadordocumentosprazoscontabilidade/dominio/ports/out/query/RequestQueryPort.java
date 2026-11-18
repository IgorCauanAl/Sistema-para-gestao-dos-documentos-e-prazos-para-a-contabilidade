package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request.RequestListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request.RequestReadModel;

import java.util.List;
import java.util.Optional;

public interface RequestQueryPort {

    Optional<RequestReadModel> findById(Long requestId);

    List<RequestListItemReadModel> findByCustomerId(Long customerId);
}
