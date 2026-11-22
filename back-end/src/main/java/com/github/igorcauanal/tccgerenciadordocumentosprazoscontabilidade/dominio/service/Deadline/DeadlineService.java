package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Deadline;


import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.DeadlineNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Deadline.Deadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.CurrentStage;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.DeadlinePriority;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Deadline.DeadlineRepositoryPort;

import java.text.Normalizer;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public class DeadlineService implements DeadlineServicePort {

    private final DeadlineRepositoryPort repository;
    private final Clock clock;

    public DeadlineService(DeadlineRepositoryPort repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public List<Deadline> listByCustomer(Long customerId) {
        if (customerId == null) {
            throw new IllegalArgumentException("customerId é obrigatório");
        }
        return repository.listByCustomer(customerId);
    }

    @Override
    public Deadline markAsDelivered(Long deadlineId) {
        if (deadlineId == null) {
            throw new IllegalArgumentException("deadlineId é obrigatório");
        }

        Deadline deadline = repository.findById(deadlineId)
                .orElseThrow(() -> new DeadlineNotFoundException(deadlineId));

        deadline.markAsDelivered(LocalDateTime.now(clock));
        return repository.save(deadline);
    }

    @Override
    public Optional<Deadline> createFromDocument(Document document) {
        if (document == null) {
            throw new IllegalArgumentException("Documento é obrigatório");
        }
        if (document.getDueDate() == null) {
            return Optional.empty();
        }

        DeadlineTemplate template = resolveTemplate(document.getDocumentType());

        boolean alreadyExists = repository.listByCustomer(document.getCustomerId()).stream()
                .anyMatch(existing -> isSameObligation(existing, template.obligation(), document.getCompetence())
                        && isOpen(existing));

        if (alreadyExists) {
            return Optional.empty();
        }

        Deadline deadline = Deadline.create(
                document.getCustomerId(),
                template.obligation(),
                template.category(),
                document.getCompetence(),
                document.getDueDate(),
                resolvePriority(document.getDueDate()),
                CurrentStage.RECEBIDO
        );

        return Optional.of(repository.save(deadline));
    }

    private boolean isSameObligation(Deadline deadline, String obligation, String competence) {
        return deadline.getObligation().equalsIgnoreCase(obligation)
                && deadline.getCompetence().equals(competence);
    }

    private boolean isOpen(Deadline deadline) {
        return deadline.getStatus() != StatusDeadline.CONCLUIDO
                && deadline.getStatus() != StatusDeadline.CANCELADO;
    }

    private DeadlinePriority resolvePriority(LocalDate dueDate) {
        long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(clock), dueDate);
        if (daysUntilDue <= 1) {
            return DeadlinePriority.ALTA;
        }
        if (daysUntilDue <= 7) {
            return DeadlinePriority.MEDIA;
        }
        return DeadlinePriority.BAIXA;
    }

    /**
     * Converte o tipo livre do documento em uma obrigação conhecida.
     * Tipos não mapeados são mantidos como estão, na categoria "Outros".
     */
    private DeadlineTemplate resolveTemplate(String documentType) {
        String normalized = normalize(documentType);

        if (normalized.contains("fgts")) {
            return new DeadlineTemplate("FGTS", "Trabalhista");
        }
        if (containsWord(normalized, "das")) {
            return new DeadlineTemplate("DAS", "Fiscal");
        }
        if (normalized.contains("esocial")) {
            return new DeadlineTemplate("eSocial", "Trabalhista");
        }
        if (normalized.contains("dctf")) {
            return new DeadlineTemplate("DCTF", "Fiscal");
        }
        if (normalized.contains("folha")) {
            return new DeadlineTemplate("Folha de pagamento", "Trabalhista");
        }
        if (normalized.contains("dre")) {
            return new DeadlineTemplate("DRE", "Contábil");
        }
        if (normalized.contains("imposto")) {
            return new DeadlineTemplate("Guia de imposto", "Fiscal");
        }
        if (normalized.contains("declaracao")) {
            return new DeadlineTemplate("Declaração", "Fiscal");
        }
        if (normalized.contains("extrato")) {
            return new DeadlineTemplate("Extrato bancário", "Contábil");
        }
        if (normalized.contains("nota")) {
            return new DeadlineTemplate("Notas fiscais", "Fiscal");
        }
        if (normalized.contains("demonstrativo")) {
            return new DeadlineTemplate("Demonstrativo contábil", "Contábil");
        }

        return new DeadlineTemplate(documentType, "Outros");
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    private static boolean containsWord(String normalized, String word) {
        return Arrays.asList(normalized.split("[^a-z0-9]+")).contains(word);
    }

    private record DeadlineTemplate(String obligation, String category) {
    }
}
