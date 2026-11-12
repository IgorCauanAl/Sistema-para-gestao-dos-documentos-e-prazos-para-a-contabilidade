package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Deadline.Deadline;
import java.util.List;

public interface DeadlineServicePort {

     Deadline markAsDelivered(Long deadlineId);
}