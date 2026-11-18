package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Deadline;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DeadlineRepositoryPort {

    Deadline save(Deadline deadline);

    Optional<Deadline> findById(Long deadlineId);

    List<Deadline> listByCustomer(Long customerId);

    List<Deadline> listByStatusAndDueDate(StatusDeadline status, LocalDate dueDate);
}