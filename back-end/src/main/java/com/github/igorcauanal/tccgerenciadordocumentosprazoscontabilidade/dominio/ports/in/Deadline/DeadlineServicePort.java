package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;

import java.util.Optional;

public interface DeadlineServicePort {

    Deadline markAsDelivered(Long deadlineId);

    /**
     * Cria um prazo a partir de um documento que possua data de vencimento.
     * Retorna vazio quando o documento não tem vencimento ou quando já existe
     * um prazo aberto para a mesma obrigação/competência do cliente.
     */
    Optional<Deadline> createFromDocument(Document document);
}
