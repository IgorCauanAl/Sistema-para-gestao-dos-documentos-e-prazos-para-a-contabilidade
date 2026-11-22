package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.service.Customer;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.AlreadyRegisteredCustomerException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.exception.CustomerNotFoundException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.Customer.Customer;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.enums.Customer.PendingStatus;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Customer.CustomerRepositoryPort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepositoryPort customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    void registerShouldSaveWhenCnpjIsNew() {
        when(customerRepository.findByCnpj("12.345.678/9012-34")).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Customer result = customerService.register(
                "12345678901234",
                "Alpha Tecnologia",
                "Carlos Almeida",
                "contato@alpha.com",
                "Rua A, 1"
        );

        assertNotNull(result);
        assertEquals("12.345.678/9012-34", result.getCnpj());
        assertEquals(PendingStatus.PENDENTE, result.getPendingStatus());
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void registerShouldThrowWhenCnpjAlreadyExists() {
        Customer existing = Customer.reconstitute(
                1L, "12345678901234", "Alpha", "Carlos", "contato@alpha.com", "Rua A, 1",
                PendingStatus.PENDENTE, null
        );
        when(customerRepository.findByCnpj("12.345.678/9012-34")).thenReturn(Optional.of(existing));

        assertThrows(AlreadyRegisteredCustomerException.class, () -> customerService.register(
                "12345678901234",
                "Alpha Tecnologia",
                "Carlos Almeida",
                "contato@alpha.com",
                "Rua A, 1"
        ));

        verify(customerRepository, never()).save(any());
    }

    @Test
    void updateShouldThrowWhenCustomerNotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> customerService.update(
                99L, "Novo Nome", "Novo Responsavel", "novo@email.com", "Novo Endereco"
        ));
    }

    @Test
    void updateShouldSaveWhenCustomerExists() {
        Customer existing = Customer.reconstitute(
                1L, "12345678901234", "Alpha", "Carlos", "contato@alpha.com", "Rua A, 1",
                PendingStatus.PENDENTE, LocalDateTime.now()
        );
        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Customer result = customerService.update(1L, "Alpha Atualizada", "Carlos", "novo@alpha.com", "Rua B, 2");

        assertEquals("Alpha Atualizada", result.getLegalName());
        assertEquals("novo@alpha.com", result.getEmail());
        verify(customerRepository).save(existing);
    }

    @Test
    void deleteShouldThrowWhenCustomerNotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> customerService.delete(99L));
        verify(customerRepository, never()).deleteById(any());
    }

    @Test
    void deleteShouldDeleteWhenCustomerExists() {
        Customer existing = Customer.reconstitute(
                1L, "12345678901234", "Alpha", "Carlos", "contato@alpha.com", "Rua A, 1",
                PendingStatus.PENDENTE, null
        );
        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));

        customerService.delete(1L);

        verify(customerRepository).deleteById(1L);
    }

    @Test
    void findByIdShouldReturnCustomer() {
        Customer existing = Customer.reconstitute(
                1L, "12345678901234", "Alpha", "Carlos", "contato@alpha.com", "Rua A, 1",
                PendingStatus.PENDENTE, null
        );
        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertEquals(existing, customerService.findById(1L));
    }

    @Test
    void listAllShouldDelegateToRepository() {
        when(customerRepository.listAll()).thenReturn(List.of());

        assertTrue(customerService.listAll().isEmpty());
        verify(customerRepository).listAll();
    }
}
