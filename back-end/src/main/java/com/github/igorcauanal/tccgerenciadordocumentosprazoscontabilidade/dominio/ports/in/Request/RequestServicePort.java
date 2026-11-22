package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.CreatedRequest;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicRequestDetails;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicTokenValidation;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.PublicUploadResult;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.Request;

import java.io.InputStream;
import java.util.List;

public interface RequestServicePort {

    CreatedRequest createRequest(Request request);

    ChecklistItem respondRequest(Long requestId, Long itemId, InputStream file, String fileName);

    ChecklistItem acceptItem(Long requestId, Long itemId);

    ChecklistItem rejectItem(Long requestId, Long itemId, String reason);

    Request findById(Long requestId);

    List<Request> findByCustomerId(Long customerId);

    PublicRequestDetails findByPublicToken(String token);

    /** Valida o token sem devolver dados do checklist; token inválido lança PublicRequestNotFoundException. */
    PublicTokenValidation validatePublicToken(String token);

    PublicUploadResult uploadPublicDocument(String token,
                                            Long itemId,
                                            InputStream file,
                                            String originalFileName,
                                            String contentType,
                                            long fileSize);
}
