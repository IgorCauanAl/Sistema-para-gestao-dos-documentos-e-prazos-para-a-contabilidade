package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.RequestRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.RequestEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.RequestMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataRequestRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class RequestPersistenceAdapter implements RequestRepositoryPort {

    private final SpringDataRequestRepository requestRepository;


    @Override
    @Transactional
    public Request save(Request request) {
        RequestEntity entity = RequestMapper.toEntity(request);
        RequestEntity saved = requestRepository.save(entity);
        return RequestMapper.toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Request> findById(Long id) {
        return requestRepository.findById(id)
                .map(RequestMapper::toDomain);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Request> findByCustomerId(Long customerId) {
        return requestRepository.findByCustomerId(customerId)   // ← bug corrigido
                .stream()
                .map(RequestMapper::toDomain)
                .toList();
    }
}