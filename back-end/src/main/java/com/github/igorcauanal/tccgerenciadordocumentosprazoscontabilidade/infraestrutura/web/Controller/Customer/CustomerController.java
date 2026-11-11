package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Customer.ClienteRequestDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Customer.ClienteResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.CustomerService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cliente")
@AllArgsConstructor
public class ClienteController {

    private final CustomerService clienteService;

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> cadastrar(@Valid @RequestBody ClienteRequestDTO request){

        Customer cliente = Customer.builder()
                .cnpj(request.getCnpj())
                .razaoSocial(request.getRazaoSocial())
                .responsavel(request.getResponsavel())
                .email(request.getEmail())
                .enderecoCompleto(request.getEnderecoCompleto())
                .build();

        Customer clienteRetornado = clienteService.register(cliente);

        ClienteResponseDTO responseDTO = ClienteResponseDTO.builder()
                .cnpj(clienteRetornado.getCnpj())
                .razaoSocial(clienteRetornado.getRazaoSocial())
                .responsavel(clienteRetornado.getResponsavel())
                .email(clienteRetornado.getEmail())
                .enderecoCompleto(clienteRetornado.getEnderecoCompleto())
                .build();



        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(clienteRetornado.getId())
                .toUri();


        return ResponseEntity.created(uri).body(responseDTO);

    }


    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listarTodos(){

        List<Customer> clientes = clienteService.listAll();

        List<ClienteResponseDTO> responseList = clientes.stream()
                .map(cliente -> ClienteResponseDTO.builder()
                        .id(cliente.getId())
                        .cnpj(cliente.getCnpj())
                        .razaoSocial(cliente.getRazaoSocial())
                        .responsavel(cliente.getResponsavel())
                        .email(cliente.getEmail())
                        .enderecoCompleto(cliente.getEnderecoCompleto())
                        .statusPendencia(cliente.getStatusPendencia())
                        .ultimoEnvioEm(cliente.getUltimoEnvioEm())
                        .build()
                )
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);

    }

}
