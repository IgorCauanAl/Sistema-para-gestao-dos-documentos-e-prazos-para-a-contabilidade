package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.BusinessException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.InvalidUploadRequestException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestItemAlreadySentException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestItemNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.PublicRequestNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.RequestNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UnsupportedUploadFileException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.UploadFileTooLargeException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.CreatedRequest;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicRequestDetails;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicTokenValidation;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicUploadResult;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Document.SendChannel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Deadline.DeadlineServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Request.RequestServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Customer.CustomerRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.DocumentRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.PublicDocumentStoragePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Document.StorageDeviceArchivePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.PublicTokenGeneratorPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Request.RequestRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util.PublicTokenHasher;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.util.PublicUploadPolicy;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

public class RequestService implements RequestServicePort {

    private final RequestRepositoryPort requestRepositoryPort;
    private final StorageDeviceArchivePort storageDeviceArchivePort;
    private final DocumentRepositoryPort documentRepositoryPort;
    private final PublicTokenGeneratorPort publicTokenGeneratorPort;
    private final PublicDocumentStoragePort publicDocumentStoragePort;
    private final CustomerRepositoryPort customerRepositoryPort;
    private final DeadlineServicePort deadlineServicePort;

    public RequestService(RequestRepositoryPort requestRepositoryPort,
                          StorageDeviceArchivePort storageDeviceArchivePort,
                          DocumentRepositoryPort documentRepositoryPort,
                          PublicTokenGeneratorPort publicTokenGeneratorPort,
                          PublicDocumentStoragePort publicDocumentStoragePort,
                          CustomerRepositoryPort customerRepositoryPort,
                          DeadlineServicePort deadlineServicePort) {
        this.requestRepositoryPort = requestRepositoryPort;
        this.storageDeviceArchivePort = storageDeviceArchivePort;
        this.documentRepositoryPort = documentRepositoryPort;
        this.publicTokenGeneratorPort = publicTokenGeneratorPort;
        this.publicDocumentStoragePort = publicDocumentStoragePort;
        this.customerRepositoryPort = customerRepositoryPort;
        this.deadlineServicePort = deadlineServicePort;
    }

    @Override
    public CreatedRequest createRequest(Request request) {
        if (request == null) {
            throw new BusinessException("A solicitação não pode ser nula");
        }

        String rawToken = publicTokenGeneratorPort.generateToken();
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalStateException("Gerador de token público retornou valor vazio");
        }

        request.assignPublicTokenHash(PublicTokenHasher.hash(rawToken));
        Request saved = requestRepositoryPort.save(request);

        // Token cru apenas neste retorno: nunca persiste, nunca entra em log.
        return new CreatedRequest(saved, rawToken);
    }

    @Override
    public ChecklistItem respondRequest(Long requestId, Long itemId, InputStream file, String fileName) {
        if (requestId == null) {
            throw new BusinessException("requestId não pode ser nulo");
        }
        if (itemId == null) {
            throw new BusinessException("itemId não pode ser nulo");
        }
        if (file == null) {
            throw new BusinessException("Arquivo da resposta é obrigatório");
        }
        if (fileName == null || fileName.isBlank()) {
            throw new BusinessException("Nome do arquivo é obrigatório");
        }

        Request request = load(requestId);
        ChecklistItem item = request.findItem(itemId);

        FileFormat fileFormat = resolveFileFormat(fileName, item.getFormatFileExpected());
        String storagePath = storageDeviceArchivePort.store(file, fileName, request.getCustomerId());

        Document document = Document.create(
                request.getCustomerId(),
                item.getDescription(),
                request.getCompetence(),
                request.getDeadline(),
                SendChannel.OUTRO,
                DocumentDirection.RECEBIDO_DO_CLIENTE,
                fileFormat,
                fileName,
                storagePath
        );
        Document savedDocument = documentRepositoryPort.save(document);
        deadlineServicePort.createFromDocument(savedDocument);

        item.registerShipping(fileName, savedDocument.getId(), LocalDateTime.now());
        requestRepositoryPort.save(request);

        return item;
    }

    private FileFormat resolveFileFormat(String fileName, String expectedFormat) {
        int dot = fileName.lastIndexOf('.');
        if (dot >= 0 && dot < fileName.length() - 1) {
            String extension = fileName.substring(dot + 1).toUpperCase(Locale.ROOT);
            try {
                return FileFormat.valueOf(extension);
            } catch (IllegalArgumentException ignored) {
                // fallback to expected format
            }
        }
        if (expectedFormat != null && !expectedFormat.isBlank()) {
            try {
                return FileFormat.valueOf(expectedFormat.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ignored) {
                // handled below
            }
        }
        throw new BusinessException("Formato de arquivo inválido ou não suportado");
    }

    @Override
    public ChecklistItem acceptItem(Long requestId, Long itemId) {
        Request request = load(requestId);
        ChecklistItem item = request.findItem(itemId);
        item.accepterShipping(LocalDateTime.now());
        requestRepositoryPort.save(request);
        return item;
    }

    @Override
    public ChecklistItem rejectItem(Long requestId, Long itemId, String reason) {
        Request request = load(requestId);
        ChecklistItem item = request.findItem(itemId);
        item.refuse(reason, LocalDateTime.now());
        requestRepositoryPort.save(request);
        return item;
    }

    @Override
    public Request findById(Long requestId) {
        return load(requestId);
    }

    @Override
    public List<Request> findByCustomerId(Long customerId) {
        if (customerId == null) {
            throw new BusinessException("customerId não pode ser nulo");
        }
        return requestRepositoryPort.findByCustomerId(customerId);
    }

    @Override
    public PublicRequestDetails findByPublicToken(String token) {
        Request request = findByRawToken(token);
        String customerName = customerRepositoryPort.findById(request.getCustomerId())
                .map(Customer::getLegalName)
                .orElse(null);
        return new PublicRequestDetails(request, customerName);
    }

    @Override
    public PublicTokenValidation validatePublicToken(String token) {
        Request request = findByRawToken(token);
        return new PublicTokenValidation(request.getId(), request.getStatus(), request.getDeadline());
    }

    @Override
    public PublicUploadResult uploadPublicDocument(String token,
                                                   Long itemId,
                                                   InputStream file,
                                                   String originalFileName,
                                                   String contentType,
                                                   long fileSize) {
        if (file == null) {
            throw new InvalidUploadRequestException("Arquivo é obrigatório");
        }
        if (fileSize < 0) {
            throw new InvalidUploadRequestException("Tamanho do arquivo inválido");
        }
        if (fileSize > PublicUploadPolicy.MAX_FILE_SIZE_BYTES) {
            throw new UploadFileTooLargeException();
        }

        Request request = findByRawToken(token);
        ChecklistItem item = findPublicItem(request, itemId);

        if (!item.isPending()) {
            throw new PublicRequestItemAlreadySentException();
        }

        String extension = PublicUploadPolicy.extractExtension(originalFileName);
        FileFormat fileFormat = PublicUploadPolicy.fromExtension(extension);
        if (fileFormat == null || !PublicUploadPolicy.isAllowedExtension(extension)) {
            throw new UnsupportedUploadFileException();
        }
        if (!PublicUploadPolicy.isMimeTypeAllowed(fileFormat, contentType)) {
            throw new UnsupportedUploadFileException("Tipo MIME não corresponde ao formato do arquivo");
        }
        FileFormat expected = PublicUploadPolicy.fromExtension(item.getFormatFileExpected());
        if (expected != null && expected != fileFormat) {
            throw new UnsupportedUploadFileException("Formato do arquivo não corresponde ao item solicitado");
        }

        String storedFileName = UUID.randomUUID() + "." + extension;
        String storagePath = publicDocumentStoragePort.store(file, request.getId(), storedFileName);

        Document document = Document.create(
                request.getCustomerId(),
                item.getDescription(),
                request.getCompetence(),
                request.getDeadline(),
                SendChannel.OUTRO,
                DocumentDirection.RECEBIDO_DO_CLIENTE,
                fileFormat,
                storedFileName,
                storagePath
        );
        Document savedDocument = documentRepositoryPort.save(document);
        deadlineServicePort.createFromDocument(savedDocument);

        item.registerShipping(storedFileName, savedDocument.getId(), LocalDateTime.now());
        Request savedRequest = requestRepositoryPort.save(request);

        return new PublicUploadResult(savedRequest, savedDocument.getId(), generateProtocol());
    }

    private Request findByRawToken(String token) {
        if (token == null || token.isBlank()) {
            throw new PublicRequestNotFoundException();
        }
        String hash = PublicTokenHasher.hash(token);
        return requestRepositoryPort.findByPublicTokenHash(hash)
                .orElseThrow(PublicRequestNotFoundException::new);
    }

    private ChecklistItem findPublicItem(Request request, Long itemId) {
        if (itemId == null) {
            throw new PublicRequestItemNotFoundException();
        }
        return request.getChecklist().stream()
                .filter(item -> Objects.equals(item.getId(), itemId))
                .findFirst()
                .orElseThrow(PublicRequestItemNotFoundException::new);
    }

    private static String generateProtocol() {
        String randomPart = UUID.randomUUID().toString().replace("-", "")
                .substring(0, 12).toUpperCase(Locale.ROOT);
        return "PROT-" + LocalDate.now().getYear() + "-" + randomPart;
    }

    private Request load(Long requestId) {
        return requestRepositoryPort.findById(requestId)
                .orElseThrow(() -> new RequestNotFoundException(requestId));
    }
}
