package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.readmodel_adapter;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.StatusCheckList;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request.RequestItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request.RequestListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.request.RequestReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.RequestQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Request.ChecklistItemEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Request.RequestEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Request.SpringDataRequestRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
public class RequestQueryAdapter implements RequestQueryPort {

    private final SpringDataRequestRepository repository;

    public RequestQueryAdapter(SpringDataRequestRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<RequestReadModel> findById(Long requestId) {
        return repository.findById(requestId).map(this::toReadModel);
    }

    @Override
    public List<RequestListItemReadModel> findByCustomerId(Long customerId) {
        return repository.findByCustomerId(customerId).stream()
                .map(r -> new RequestListItemReadModel(
                        r.getId(),
                        r.getCustomerId(),
                        r.getTitle(),
                        r.getCompetence(),
                        r.getDeadline(),
                        r.getStatus(),
                        calculateProgress(r.getChecklist())
                ))
                .toList();
    }

    private RequestReadModel toReadModel(RequestEntity entity) {
        List<RequestItemReadModel> items = entity.getChecklist() == null ? List.of() :
                entity.getChecklist().stream()
                        .sorted(Comparator.comparing(ChecklistItemEntity::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                        .map(this::toItemReadModel)
                        .toList();

        return new RequestReadModel(
                entity.getId(),
                entity.getCustomerId(),
                entity.getTitle(),
                entity.getCompetence(),
                entity.getDeadline(),
                entity.getStatus(),
                entity.getCreatedIn(),
                entity.getCompletedIn(),
                entity.getCancelledIn(),
                calculateProgress(entity.getChecklist()),
                items
        );
    }

    private RequestItemReadModel toItemReadModel(ChecklistItemEntity item) {
        return new RequestItemReadModel(
                item.getId(),
                item.getDescription(),
                item.getFormatFileExpected(),
                item.getStatus(),
                item.getNameFileSent(),
                item.getUploadedDocumentId(),
                item.getSubmitedOn(),
                item.getRevisedOn(),
                item.getReasonRefusal()
        );
    }

    private BigDecimal calculateProgress(List<ChecklistItemEntity> checklist) {
        if (checklist == null || checklist.isEmpty()) {
            return BigDecimal.ZERO;
        }
        long accepted = checklist.stream()
                .filter(i -> i.getStatus() == StatusCheckList.ACEITO)
                .count();
        return BigDecimal.valueOf(accepted)
                .divide(BigDecimal.valueOf(checklist.size()), 4, RoundingMode.HALF_UP);
    }
}
