package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in.Request;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request.Request;

import java.io.InputStream;
import java.util.List;

public interface RequestServicePort {

    Request createRequest(Request request);

    ChecklistItem respondRequest(Long requestId, Long itemId, InputStream file, String fileName);

    ChecklistItem acceptItem(Long requestId, Long itemId);

    ChecklistItem rejectItem(Long requestId, Long itemId, String reason);

    Request findById(Long requestId);

    List<Request> findByCustomerId(Long customerId);
}
