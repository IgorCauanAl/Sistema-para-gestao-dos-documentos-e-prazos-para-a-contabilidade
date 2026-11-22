package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.readmodel_adapter;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Customer.PendingStatus;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.StatusDocument;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardChartItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardChartsReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardFlowPointReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardSummaryReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DashboardChartsQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DashboardSummaryQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.CustomerEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.DeadlineEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.entity.Document.DocumentEntity;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Document.SpringDataDocumentRepository;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataCustomerRepository;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataDeadlineRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Component
public class DashboardQueryAdapter implements DashboardSummaryQueryPort, DashboardChartsQueryPort {

    private static final int FLOW_MONTHS = 6;
    private static final int MAX_TYPES = 6;
    private static final DateTimeFormatter MONTH_LABEL =
            DateTimeFormatter.ofPattern("MMM/yy", Locale.forLanguageTag("pt-BR"));

    private final SpringDataCustomerRepository customerRepository;
    private final SpringDataDocumentRepository documentRepository;
    private final SpringDataDeadlineRepository deadlineRepository;

    public DashboardQueryAdapter(SpringDataCustomerRepository customerRepository,
                                 SpringDataDocumentRepository documentRepository,
                                 SpringDataDeadlineRepository deadlineRepository) {
        this.customerRepository = customerRepository;
        this.documentRepository = documentRepository;
        this.deadlineRepository = deadlineRepository;
    }

    @Override
    public DashboardSummaryReadModel getSummary() {
        long totalCustomers = customerRepository.countAllCustomers();

        long pendingDocuments = documentRepository.countByDirectionAndStatusIn(
                DocumentDirection.ENVIADO_AO_CLIENTE,
                List.of(StatusDocument.CRIADO, StatusDocument.ENVIADO));

        LocalDate today = LocalDate.now();
        long overdueObligations = deadlineRepository.countOverdue(
                today,
                List.of(StatusDeadline.CONCLUIDO, StatusDeadline.CANCELADO));

        return new DashboardSummaryReadModel(totalCustomers, pendingDocuments, overdueObligations);
    }

    @Override
    public DashboardChartsReadModel getCharts() {
        List<DocumentEntity> documents = documentRepository.findAll();

        return new DashboardChartsReadModel(
                buildDocumentFlow(documents),
                buildCountItems(documents.stream()
                        .collect(Collectors.groupingBy(DocumentEntity::getDocumentType, Collectors.counting()))
                        .entrySet().stream()
                        .map(entry -> new DashboardChartItemReadModel(entry.getKey(), entry.getValue()))),
                buildCountItems(customerRepository.findAll().stream()
                        .filter(customer -> customer.getPendingStatus() != null)
                        .collect(Collectors.groupingBy(CustomerEntity::getPendingStatus, Collectors.counting()))
                        .entrySet().stream()
                        .map(entry -> new DashboardChartItemReadModel(
                                describePendingStatus(entry.getKey()), entry.getValue()))),
                buildCountItems(deadlineRepository.findAll().stream()
                        .filter(deadline -> deadline.getStatus() != null)
                        .collect(Collectors.groupingBy(DeadlineEntity::getStatus, Collectors.counting()))
                        .entrySet().stream()
                        .map(entry -> new DashboardChartItemReadModel(
                                describeDeadlineStatus(entry.getKey()), entry.getValue())))
        );
    }

    private List<DashboardFlowPointReadModel> buildDocumentFlow(List<DocumentEntity> documents) {
        YearMonth currentMonth = YearMonth.now();
        List<YearMonth> months = IntStream.rangeClosed(0, FLOW_MONTHS - 1)
                .mapToObj(offset -> currentMonth.minusMonths(FLOW_MONTHS - 1 - offset))
                .toList();

        Map<YearMonth, long[]> countsByMonth = months.stream()
                .collect(Collectors.toMap(month -> month, month -> new long[2]));

        for (DocumentEntity document : documents) {
            YearMonth competence = parseCompetence(document.getCompetence());
            long[] counts = competence == null ? null : countsByMonth.get(competence);
            if (counts == null) {
                continue;
            }
            if (document.getDirection() == DocumentDirection.ENVIADO_AO_CLIENTE) {
                counts[0]++;
            } else if (document.getDirection() == DocumentDirection.RECEBIDO_DO_CLIENTE) {
                counts[1]++;
            }
        }

        return months.stream()
                .map(month -> {
                    long[] counts = countsByMonth.getOrDefault(month, new long[2]);
                    String label = MONTH_LABEL.format(month).replace(".", "");
                    return new DashboardFlowPointReadModel(label, counts[0], counts[1]);
                })
                .toList();
    }

    private YearMonth parseCompetence(String competence) {
        try {
            return YearMonth.parse(competence.trim());
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private List<DashboardChartItemReadModel> buildCountItems(
            java.util.stream.Stream<DashboardChartItemReadModel> items) {
        return items
                .filter(item -> item.getLabel() != null && !item.getLabel().isBlank())
                .sorted(Comparator.comparingLong(DashboardChartItemReadModel::getValue).reversed()
                        .thenComparing(DashboardChartItemReadModel::getLabel))
                .limit(MAX_TYPES)
                .toList();
    }

    private String describePendingStatus(PendingStatus status) {
        if (status == PendingStatus.EM_DIA) {
            return "Em dia";
        }
        if (status == PendingStatus.PENDENTE) {
            return "Pendente";
        }
        return "Sem status";
    }

    private String describeDeadlineStatus(StatusDeadline status) {
        if (status == null) {
            return "Sem status";
        }
        return switch (status) {
            case PENDENTE -> "Pendente";
            case EM_ANDAMENTO -> "Em andamento";
            case ATRASADO -> "Atrasado";
            case CONCLUIDO -> "Concluído";
            case CANCELADO -> "Cancelado";
        };
    }
}
