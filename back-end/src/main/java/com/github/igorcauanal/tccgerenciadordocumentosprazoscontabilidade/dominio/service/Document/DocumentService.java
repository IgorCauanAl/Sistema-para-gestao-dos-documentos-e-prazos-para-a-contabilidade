package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Document;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.NotFoundDocumentException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.SendChannel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Document.DocumentServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.DocumentRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.StorageDeviceArchivePort;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;

public class DocumentService implements DocumentServicePort {

    private final DocumentRepositoryPort documentRepositoryPort;
    private final StorageDeviceArchivePort storageDeviceArchivePort;
    private final DeadlineServicePort deadlineServicePort;

    public DocumentService(DocumentRepositoryPort documentRepositoryPort,
                           StorageDeviceArchivePort storageDeviceArchivePort,
                           DeadlineServicePort deadlineServicePort) {
        this.documentRepositoryPort = documentRepositoryPort;
        this.storageDeviceArchivePort = storageDeviceArchivePort;
        this.deadlineServicePort = deadlineServicePort;
    }

    @Override
    public Document saveDocument(InputStream fileStream,
                                 String originalFileName,
                                 Long customerId,
                                 String documentType,
                                 String competence,
                                 LocalDate dueDate,
                                 SendChannel sendChannel,
                                 DocumentDirection direction,
                                 FileFormat fileFormat) {

        if (fileStream == null) {
            throw new IllegalArgumentException("Arquivo é obrigatório");
        }
        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException("Nome do arquivo é obrigatório");
        }

        String storagePath = storageDeviceArchivePort.store(fileStream, originalFileName, customerId);

        Document document = Document.create(
                customerId,
                documentType,
                competence,
                dueDate,
                sendChannel,
                direction,
                fileFormat,
                originalFileName,
                storagePath
        );

        Document savedDocument = documentRepositoryPort.save(document);

        // Todo documento com vencimento gera um prazo correspondente.
        deadlineServicePort.createFromDocument(savedDocument);

        return savedDocument;
    }

    @Override
    public Document sendDocument(Long documentId) {
        Document document = load(documentId);
        document.resend();
        return documentRepositoryPort.save(document);
    }

    @Override
    public DocumentServicePort.DocumentFile viewDocument(Long documentId) {
        Document document = load(documentId);
        document.markAsViewed();
        documentRepositoryPort.save(document);                                // ← 1 save
        InputStream content = storageDeviceArchivePort.load(document.getStoragePath());
        return new DocumentServicePort.DocumentFile(document, content);
    }

    @Override
    public DocumentServicePort.DocumentFile downloadDocument(Long documentId) {
        Document document = load(documentId);
        document.markAsDownloaded();
        documentRepositoryPort.save(document);
        InputStream content = storageDeviceArchivePort.load(document.getStoragePath());
        return new DocumentServicePort.DocumentFile(document, content);
    }


    public List<Document> listDocuments(DocumentDirection direction) {
        if (direction == null) {
            return documentRepositoryPort.findAll();
        }
        return documentRepositoryPort.findByDirection(direction);
    }

    private Document load(Long documentId) {
        if (documentId == null) {
            throw new IllegalArgumentException("documentId não pode ser nulo");
        }
        return documentRepositoryPort.findById(documentId)
                .orElseThrow(() -> new NotFoundDocumentException(documentId));
    }
}
