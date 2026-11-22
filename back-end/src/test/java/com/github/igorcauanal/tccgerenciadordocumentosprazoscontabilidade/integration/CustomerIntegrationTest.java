package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.integration;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.Customer.CustomerRepositoryPort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@WithMockUser(roles = "CONTADOR")
class CustomerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepositoryPort customerRepositoryPort;

    @MockitoSpyBean
    private CustomerRepositoryPort customerRepositorySpy;

    private String customerJson(String cnpj, String legalName, String responsibleName, String email, String fullAddress) {
        return "{"
                + "\"cnpj\":\"" + cnpj + "\","
                + "\"legalName\":\"" + legalName + "\","
                + "\"responsibleName\":\"" + responsibleName + "\","
                + "\"email\":\"" + email + "\","
                + "\"fullAddress\":\"" + fullAddress + "\""
                + "}";
    }

    @Test
    void shouldRegisterCustomerEndToEnd() throws Exception {
        String json = customerJson("12345678000190", "Alpha Tecnologia", "Carlos Almeida", "contato@alpha.com", "Rua A, 1");

        MvcResult result = mockMvc.perform(post("/customers")
                        .contentType(APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cnpj").value("12.345.678/0001-90"))
                .andExpect(jsonPath("$.legalName").value("Alpha Tecnologia"))
                .andExpect(jsonPath("$.email").value("contato@alpha.com"))
                .andReturn();

        assertThat(result.getResponse().getHeader("Location")).isNotBlank();
        assertThat(customerRepositoryPort.listAll()).hasSize(1);
    }

    @Test
    void shouldRejectDuplicateCustomerAndNotPersistTwice() throws Exception {
        String json = customerJson("99999999000199", "Beta Comercio", "Mariana Costa", "financeiro@beta.com", "Rua B, 2");

        mockMvc.perform(post("/customers")
                        .contentType(APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/customers")
                        .contentType(APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isConflict());

        verify(customerRepositorySpy, times(1)).save(any());
    }

    @Test
    void shouldNotLeakStackTraceWhenPersistenceFails() throws Exception {
        String json = customerJson("88888888000188", "Gamma Servicos", "Joao Silva", "contato@gamma.com", "Rua C, 3");

        doThrow(new RuntimeException("database unavailable"))
                .when(customerRepositorySpy).save(any());

        MvcResult result = mockMvc.perform(post("/customers")
                        .contentType(APPLICATION_JSON)
                        .content(json))
                .andExpect(status().is5xxServerError())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertThat(body).doesNotContain("at com.github");
        assertThat(body).doesNotContain("RuntimeException");
    }
}
