package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.readmodel_adapter;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Deadline.StatusDeadline;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.StatusDocument;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.readmodel.dashboard.DashboardSummaryReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DashboardSummaryQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.Document.SpringDataDocumentRepository;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataCustomerRepository;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.repository.SpringDataDeadlineRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DashboardQueryAdapter implements DashboardSummaryQueryPort {

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
}
