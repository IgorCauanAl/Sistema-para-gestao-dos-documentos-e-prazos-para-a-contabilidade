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
                .map(r -> {
                    long accepted = countAccepted(r.getChecklist());
                    int total = countTotal(r.getChecklist());
                    return new RequestListItemReadModel(
                            r.getId(),
                            r.getCustomerId(),
                            r.getTitle(),
                            r.getCompetence(),
                            r.getDeadline(),
                            r.getStatus(),
                            accepted,
                            total,
                            calculateProgress(accepted, total)
                    );
                })
                .toList();
    }

    private RequestReadModel toReadModel(RequestEntity entity) {
        List<RequestItemReadModel> items = entity.getChecklist() == null ? List.of() :
                entity.getChecklist().stream()
                        .sorted(Comparator.comparing(ChecklistItemEntity::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                        .map(this::toItemReadModel)
                        .toList();

        long accepted = countAccepted(entity.getChecklist());
        int total = countTotal(entity.getChecklist());
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
                accepted,
                total,
                calculateProgress(accepted, total),
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

    private long countAccepted(List<ChecklistItemEntity> checklist) {
        if (checklist == null) {
            return 0;
        }
        return checklist.stream()
                .filter(i -> i.getStatus() == StatusCheckList.ACEITO)
                .count();
    }

    private int countTotal(List<ChecklistItemEntity> checklist) {
        return checklist == null ? 0 : checklist.size();
    }

    /** Mesma regra do domínio: aceitos / total, arredondado em 4 casas. */
    private BigDecimal calculateProgress(long accepted, int total) {
        if (total == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(accepted)
                .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP);
    }
}
