package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.deadline.DeadlineListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DeadlineEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SpringDataDeadlineRepository extends JpaRepository<DeadlineEntity, Long> {

    List<DeadlineEntity> findByCustomerId(Long clienteId);

    List<DeadlineEntity> findByStatusAndDueDate(StatusDeadline statusDeadline, LocalDate dueDate);

    @Query("SELECT COUNT(d) FROM DeadlineEntity d WHERE d.dueDate < :today AND d.status NOT IN :closedStatuses")
    long countOverdue(@Param("today") LocalDate today, @Param("closedStatuses") List<StatusDeadline> closedStatuses);

    @Query("SELECT new com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.deadline.DeadlineListItemReadModel(" +
            "d.id, d.customerId, c.corporateName, d.obligation, d.category, d.competence, " +
            "d.dueDate, d.priority, d.currentStage, d.status, " +
            "CASE WHEN (d.status NOT IN :closedStatuses AND d.dueDate < :today) THEN true ELSE false END) " +
            "FROM DeadlineEntity d, CustomerEntity c " +
            "WHERE c.id = d.customerId " +
            "ORDER BY d.dueDate ASC, d.id ASC")
    List<DeadlineListItemReadModel> listAllReadModels(@Param("today") LocalDate today,
                                                      @Param("closedStatuses") List<StatusDeadline> closedStatuses);

    @Query("SELECT new com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.deadline.DeadlineListItemReadModel(" +
            "d.id, d.customerId, c.corporateName, d.obligation, d.category, d.competence, " +
            "d.dueDate, d.priority, d.currentStage, d.status, " +
            "CASE WHEN (d.status NOT IN :closedStatuses AND d.dueDate < :today) THEN true ELSE false END) " +
            "FROM DeadlineEntity d, CustomerEntity c " +
            "WHERE c.id = d.customerId AND d.customerId = :customerId " +
            "ORDER BY d.dueDate ASC, d.id ASC")
    List<DeadlineListItemReadModel> listReadModelsByCustomerId(@Param("customerId") Long customerId,
                                                               @Param("today") LocalDate today,
                                                               @Param("closedStatuses") List<StatusDeadline> closedStatuses);

}
