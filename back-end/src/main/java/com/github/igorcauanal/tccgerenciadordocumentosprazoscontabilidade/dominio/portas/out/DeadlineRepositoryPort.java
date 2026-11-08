package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Prazo;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.StatusDeadline;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PrazoRepositoryPort {

    Prazo save(Prazo prazo);

    Optional<Prazo> findById(Long deadlineId);

    List<Prazo> listByCustomer(Long clienteId);

    List<Prazo> listByStatusAndExpiration(StatusDeadline statusDeadline, LocalDate dataVencimento);

}
