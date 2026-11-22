package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.config;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.AuthenticateServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Customer.CustomerServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Document.DocumentServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Request.RequestServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.dashboard.DashboardQueryServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Customer.CustomerRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.PasswordEncoderPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.PublicTokenGeneratorPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DashboardChartsQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.query.DashboardSummaryQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Deadline.DeadlineRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.DocumentRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.PublicDocumentStoragePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.StorageDeviceArchivePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Request.RequestRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.UserRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Customer.CustomerService;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Dashboard.DashboardService;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Deadline.DeadlineService;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Document.DocumentService;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Request.RequestService;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.User.UserService;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security.SecureRandomPublicTokenGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class ServiceConfig {

    @Bean
    public CustomerServicePort customerServicePort(CustomerRepositoryPort customerRepositoryPort) {
        return new CustomerService(customerRepositoryPort);
    }

    @Bean
    public DeadlineServicePort deadlineServicePort(DeadlineRepositoryPort deadlineRepositoryPort, Clock clock) {
        return new DeadlineService(deadlineRepositoryPort, clock);
    }

    @Bean
    public DocumentServicePort documentServicePort(DocumentRepositoryPort documentRepositoryPort,
                                                  StorageDeviceArchivePort storageDeviceArchivePort,
                                                  DeadlineServicePort deadlineServicePort) {
        return new DocumentService(documentRepositoryPort, storageDeviceArchivePort, deadlineServicePort);
    }

    @Bean
    public DashboardQueryServicePort dashboardServicePort(DashboardSummaryQueryPort dashboardSummaryQueryPort,
                                                         DashboardChartsQueryPort dashboardChartsQueryPort) {
        return new DashboardService(dashboardSummaryQueryPort, dashboardChartsQueryPort);
    }

    @Bean
    public PublicTokenGeneratorPort publicTokenGeneratorPort() {
        return new SecureRandomPublicTokenGenerator();
    }

    @Bean
    public RequestServicePort requestServicePort(RequestRepositoryPort requestRepositoryPort,
                                                StorageDeviceArchivePort storageDeviceArchivePort,
                                                DocumentRepositoryPort documentRepositoryPort,
                                                PublicTokenGeneratorPort publicTokenGeneratorPort,
                                                PublicDocumentStoragePort publicDocumentStoragePort,
                                                CustomerRepositoryPort customerRepositoryPort,
                                                DeadlineServicePort deadlineServicePort) {
        return new RequestService(requestRepositoryPort,
                storageDeviceArchivePort,
                documentRepositoryPort,
                publicTokenGeneratorPort,
                publicDocumentStoragePort,
                customerRepositoryPort,
                deadlineServicePort);
    }

    @Bean
    public AuthenticateServicePort userServicePort(UserRepositoryPort userRepositoryPort, PasswordEncoderPort passwordEncoderPort) {
        return new UserService(userRepositoryPort, passwordEncoderPort);
    }
}
