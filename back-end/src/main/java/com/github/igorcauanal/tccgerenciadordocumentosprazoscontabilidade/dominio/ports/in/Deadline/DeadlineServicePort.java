package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;

public interface DeadlineServicePort {

     Deadline markAsDelivered(Long deadlineId);
}