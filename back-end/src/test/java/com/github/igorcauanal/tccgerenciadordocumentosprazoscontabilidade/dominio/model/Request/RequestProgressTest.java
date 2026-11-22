package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.StatusCheckList;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RequestProgressTest {

    private Request novaSolicitacao() {
        return Request.create(
                1L,
                "Documentos de 09/2026",
                "09/2026",
                LocalDate.now().plusDays(10),
                LocalDateTime.now()
        );
    }

    private void aceitar(ChecklistItem item, LocalDateTime agora) {
        item.registerShipping(item.getDescription() + ".pdf", 1L, agora);
        item.accepterShipping(agora);
    }

    @Test
    void progressShouldBeZeroWhenChecklistIsEmpty() {
        Request request = novaSolicitacao();

        assertEquals(0, request.totalItems());
        assertEquals(0, request.acceptedItems());
        assertEquals(BigDecimal.ZERO, request.calculateProgress());
    }

    @Test
    void progressShouldBeAcceptedDividedByTotal() {
        Request request = novaSolicitacao();
        LocalDateTime agora = LocalDateTime.now();
        ChecklistItem first = request.addChecklistItem("Extrato", "PDF");
        ChecklistItem second = request.addChecklistItem("Notas fiscais", "PDF");
        ChecklistItem third = request.addChecklistItem("Balancete", "PDF");

        aceitar(first, agora);
        aceitar(second, agora);

        assertEquals(3, request.totalItems());
        assertEquals(2, request.acceptedItems());
        assertEquals(new BigDecimal("0.6667"), request.calculateProgress());
        assertEquals(StatusCheckList.PENDENTE, third.getStatus());
    }

    @Test
    void progressShouldRoundToFourDecimalPlaces() {
        Request request = novaSolicitacao();
        LocalDateTime agora = LocalDateTime.now();

        aceitar(request.addChecklistItem("Extrato", "PDF"), agora);
        request.addChecklistItem("Notas fiscais", "PDF");
        request.addChecklistItem("Balancete", "PDF");

        assertEquals(1, request.acceptedItems());
        assertEquals(3, request.totalItems());
        assertEquals(new BigDecimal("0.3333"), request.calculateProgress());
    }
}
