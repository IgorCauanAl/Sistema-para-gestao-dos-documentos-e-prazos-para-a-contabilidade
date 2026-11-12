package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.DocumentDirection;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.FileFormat;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.enums.Document.SendChannel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Request.RequestServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Document.DocumentRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Document.StorageDeviceArchivePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Request.RequestRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.BusinessException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.RequestNotFoundException;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class RequestService implements RequestServicePort {


        private final RequestRepositoryPort requestRepositoryPort;
        private final StorageDeviceArchivePort storageDeviceArchivePort;
        private final DocumentRepositoryPort documentRepositoryPort;

        public RequestService(RequestRepositoryPort requestRepositoryPort,
                              StorageDeviceArchivePort storageDeviceArchivePort,
                              DocumentRepositoryPort documentRepositoryPort) {
            this.requestRepositoryPort = requestRepositoryPort;
            this.storageDeviceArchivePort = storageDeviceArchivePort;
            this.documentRepositoryPort = documentRepositoryPort;
        }

        @Override
        public Request createRequest(Request request) {
            if (request == null) {
                throw new BusinessException("A solicitação não pode ser nula");
            }
            return requestRepositoryPort.save(request);
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

        private Request load(Long requestId) {
            return requestRepositoryPort.findById(requestId)
                    .orElseThrow(() -> new RequestNotFoundException(requestId));
        }
    }
