package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.request.RequestListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.request.RequestReadModel;

import java.util.List;
import java.util.Optional;

public interface RequestQueryPort {

    Optional<RequestReadModel> findById(Long requestId);

    List<RequestListItemReadModel> findByCustomerId(Long customerId);
}
