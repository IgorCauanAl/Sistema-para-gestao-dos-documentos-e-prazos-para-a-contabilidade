package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Request;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Request.RequestStatus;

import java.time.LocalDate;

/** Resultado da validação de um token público (sem expor o token cru). */
public record PublicTokenValidation(Long requestId, RequestStatus status, LocalDate deadline) {
}
