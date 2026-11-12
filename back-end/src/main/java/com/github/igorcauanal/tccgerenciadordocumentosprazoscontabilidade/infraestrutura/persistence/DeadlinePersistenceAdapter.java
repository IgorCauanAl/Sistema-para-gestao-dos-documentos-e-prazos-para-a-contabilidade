package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.persistence;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Deadline.StatusDeadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Deadline.DeadlineRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DeadlineEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.mapper.Deadline.DeadlineMapper;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataDeadlineRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@AllArgsConstructor
public class DeadlinePersistenceAdapter implements DeadlineRepositoryPort {

    private final SpringDataDeadlineRepository dataDeadlineRepository;

    @Override
    public Deadline save(Deadline deadline) {

        DeadlineEntity entity = DeadlineMapper.toEntity(deadline);
        DeadlineEntity entitySalva = dataDeadlineRepository.save(entity);


        return DeadlineMapper.toDomain(entitySalva);
    }

    @Override
    public Optional<Deadline> findById(Long deadlineId) {
        return dataDeadlineRepository.findById(deadlineId)
                .map(DeadlineMapper::toDomain);
    }

    @Override
    public List<Deadline> listByCustomer(Long clienteId) {
        return dataDeadlineRepository.findByCustomer(clienteId)
                .stream()
                .map(DeadlineMapper::toDomain)
                .toList();
    }

    @Override
    public List<Deadline>  listByStatusAndDueDate (StatusDeadline statusDeadline, LocalDate dueDate) {
        return dataDeadlineRepository.findByStatusAndDueDate(statusDeadline, dueDate)
                .stream()
                .map(DeadlineMapper::toDomain)
                .toList();
    }
}
