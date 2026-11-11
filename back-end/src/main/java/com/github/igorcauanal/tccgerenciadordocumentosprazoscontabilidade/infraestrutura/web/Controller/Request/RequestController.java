package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Controller
public class RequestController {

    public ResponseEntity<SolicitacaoResponseDTO> criarSolicitacao(SolicitacaoRequestDTO request)

    public ResponseEntity<DocumentoResponseDTO> responderSolicitacao(@PathVariable ("id") Long solicitacaoId, @RequestParam ("arquivo") MultipartFile arquivo)



}
