package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Deadline;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.DeadlineNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Deadline.DeadlineRepositoryPort;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

public class DeadlineService implements DeadlineServicePort {

    private final DeadlineRepositoryPort repository;
    private final Clock clock;

    public DeadlineService(DeadlineRepositoryPort repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public List<Deadline> listByCustomer(Long customerId) {
        if (customerId == null) {
            throw new IllegalArgumentException("customerId é obrigatório");
        }
        return repository.listByCustomer(customerId);
    }

    @Override
    public Deadline markAsDelivered(Long deadlineId) {
        if (deadlineId == null) {
            throw new IllegalArgumentException("deadlineId é obrigatório");
        }

        Deadline deadline = repository.findById(deadlineId)
                .orElseThrow(() -> new DeadlineNotFoundException(deadlineId));

        deadline.markAsDelivered(LocalDateTime.now(clock));
        return repository.save(deadline);
    }
}
