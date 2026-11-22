package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.config;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.DocumentRepositoryPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Gera prazos para documentos que já existiam antes da criação automática.
 *
 * <p>A operação é idempotente: documentos que já possuem um prazo aberto para a
 * mesma obrigação/competência são ignorados. Pode ser desativada com
 * {@code app.deadlines.backfill-enabled=false}.</p>
 */
@Component
@ConditionalOnProperty(name = "app.deadlines.backfill-enabled", havingValue = "true", matchIfMissing = true)
public class DeadlineBackfillRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DeadlineBackfillRunner.class);

    private final DocumentRepositoryPort documentRepositoryPort;
    private final DeadlineServicePort deadlineServicePort;

    public DeadlineBackfillRunner(DocumentRepositoryPort documentRepositoryPort,
                                  DeadlineServicePort deadlineServicePort) {
        this.documentRepositoryPort = documentRepositoryPort;
        this.deadlineServicePort = deadlineServicePort;
    }

    @Override
    public void run(ApplicationArguments args) {
        int created = 0;

        for (Document document : documentRepositoryPort.findAll()) {
            if (document.getDueDate() == null) {
                continue;
            }
            try {
                if (deadlineServicePort.createFromDocument(document).isPresent()) {
                    created++;
                }
            } catch (RuntimeException ex) {
                log.warn("Não foi possível gerar prazo para o documento {}", document.getId(), ex);
            }
        }

        if (created > 0) {
            log.info("Backfill de prazos: {} prazo(s) criado(s) a partir de documentos existentes.", created);
        }
    }
}
