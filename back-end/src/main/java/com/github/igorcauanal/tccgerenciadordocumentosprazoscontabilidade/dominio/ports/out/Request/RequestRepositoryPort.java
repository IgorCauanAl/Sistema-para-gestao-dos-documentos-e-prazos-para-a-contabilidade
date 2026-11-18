package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.Request;

import java.util.List;
import java.util.Optional;

public interface RequestRepositoryPort {

    Request save(Request request);

    Optional<Request> findById(Long id);

    List<Request> findByCustomerId(Long customerId);

}
