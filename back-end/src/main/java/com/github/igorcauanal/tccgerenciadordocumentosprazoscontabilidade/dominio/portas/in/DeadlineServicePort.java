package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Prazo;

import java.util.List;

public interface PrazoServicePort {

     List<Prazo> findByClient(Long clienteId);

     void finishDeadline(Long prazoId);

}
