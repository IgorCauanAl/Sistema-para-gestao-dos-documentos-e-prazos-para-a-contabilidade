package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.ChecklistItem;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Document;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Request;

import java.io.InputStream;
import java.util.List;

public interface RequestServicePort {

    Request createRequest(Request request);

    // Upload do cliente para um item específico /
    ChecklistItem respondRequest(Long requestId, Long itemId, InputStream file, String fileName);

    //Contador aceita o item enviado → ACCEPTED./
    ChecklistItem acceptItem(Long requestId, Long itemId);

    //Contador recusa o item enviado → REJECTED. /
    ChecklistItem rejectItem(Long requestId, Long itemId, String reason);

    Request findById(Long requestId);

    List<Request> findByCustomerId(Long customerId);

}
