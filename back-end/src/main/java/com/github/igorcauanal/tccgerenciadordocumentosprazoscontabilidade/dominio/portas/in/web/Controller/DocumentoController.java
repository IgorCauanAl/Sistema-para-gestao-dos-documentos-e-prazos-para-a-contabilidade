package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web;

import jakarta.annotation.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@Controller
public class DocumentoController {

    public ResponseEntity<DocumentoResponseDTO> enviarDocumento(@RequestParam("arquivo") MultipartFile arquivo, @RequestParam ("clienteId") Long clienteId);

    public  ResponseEntity<Resource>  baixarDocumento(@PathVariable ("id") Long documentoId);

}
