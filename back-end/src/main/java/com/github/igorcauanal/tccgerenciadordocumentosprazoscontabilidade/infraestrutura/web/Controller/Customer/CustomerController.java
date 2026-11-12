package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.Controller.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.readmodel.customer.CustomerListItemReadModel;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.Customer.CustomerServicePort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.out.query.CustomerQueryPort;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Customer.CustomerRequestDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Customer.CustomerResponseDTO;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Customer.CustomerUpdateRequestDTO;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/customers")
@AllArgsConstructor
public class CustomerController {

    private final CustomerServicePort customerService;
    private final CustomerQueryPort customerQueryPort;

    @PostMapping
    public ResponseEntity<CustomerResponseDTO> register(@Valid @RequestBody CustomerRequestDTO request) {

        Customer customer = customerService.register(
                request.getCnpj(),
                request.getLegalName(),
                request.getResponsibleName(),
                request.getEmail(),
                request.getFullAddress()
        );

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(customer.getId())
                .toUri();

        return ResponseEntity.created(location).body(CustomerResponseDTO.from(customer));
    }

    // GET /customers — tela de gestão (lista) usando read model
    @GetMapping
    public ResponseEntity<List<CustomerListItemReadModel>> listAll() {
        return ResponseEntity.ok(customerQueryPort.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> findById(@PathVariable Long id) {
        Customer customer = customerService.findById(id);
        return ResponseEntity.ok(CustomerResponseDTO.from(customer));
    }

    // PUT /customers/{id} — edição do cadastro
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponseDTO> update(@PathVariable Long id,
                                                      @Valid @RequestBody CustomerUpdateRequestDTO request) {

        Customer customer = customerService.update(
                id,
                request.getLegalName(),
                request.getResponsibleName(),
                request.getEmail(),
                request.getFullAddress()
        );

        return ResponseEntity.ok(CustomerResponseDTO.from(customer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}