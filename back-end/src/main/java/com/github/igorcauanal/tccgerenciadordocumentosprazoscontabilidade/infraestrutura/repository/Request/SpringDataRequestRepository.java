package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Request.RequestEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataRequestRepository extends JpaRepository<RequestEntity, Long> {

    //Carrega o checklist junto — evita LazyInitializationException no mapper.
    @EntityGraph(attributePaths = "checklist")
    List<RequestEntity> findByCustomerId(Long customerId);

    //Sobrescreve o findById herdado para carregar o checklist junto.
    @Override
    @EntityGraph(attributePaths = "checklist")
    Optional<RequestEntity> findById(Long id);

}
