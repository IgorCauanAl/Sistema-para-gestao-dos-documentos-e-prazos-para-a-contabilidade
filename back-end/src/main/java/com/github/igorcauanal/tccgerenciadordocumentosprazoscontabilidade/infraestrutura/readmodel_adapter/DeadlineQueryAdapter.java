package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.readmodel_adapter;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.deadline.DeadlineListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DeadlineQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataDeadlineRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DeadlineQueryAdapter implements DeadlineQueryPort {

    private static final List<StatusDeadline> CLOSED_STATUSES = List.of(
            StatusDeadline.CONCLUIDO, StatusDeadline.CANCELADO
    );

    private final SpringDataDeadlineRepository repository;

    public DeadlineQueryAdapter(SpringDataDeadlineRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<DeadlineListItemReadModel> listAll() {
        return repository.listAllReadModels(LocalDate.now(), CLOSED_STATUSES);
    }

    @Override
    public List<DeadlineListItemReadModel> listByCustomerId(Long customerId) {
        return repository.listReadModelsByCustomerId(customerId, LocalDate.now(), CLOSED_STATUSES);
    }
}
