package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PrazoController {

    public ResponseEntity<List<PrazoResponseDTO>> listarPorCliente(@PathVariable ("clienteId") Long clienteId);

    public ResponseEntity<Void> marcarComoEntregue(@PathVariable ("id") Long prazoId);

}
