package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Deadline.Deadline;

import java.util.List;

public interface DeadlineServicePort {

     List<Deadline> findByCustomer(Long clienteId);

     void finishDeadline(Long prazoId);

}
