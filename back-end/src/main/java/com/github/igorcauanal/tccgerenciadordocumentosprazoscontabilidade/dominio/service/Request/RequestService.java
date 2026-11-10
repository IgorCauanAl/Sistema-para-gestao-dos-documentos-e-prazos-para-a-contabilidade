package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Request.RequestServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.Request.RequestRepositoryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.BusinessException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.RequestNotFoundException;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;

public class RequestService implements RequestServicePort {


        private final RequestRepositoryPort requestRepositoryPort;

        public RequestService(RequestRepositoryPort requestRepositoryPort) {
            this.requestRepositoryPort = requestRepositoryPort;
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
            item.registerShipping(fileName, LocalDateTime.now());
            requestRepositoryPort.save(request);

            return item;
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
