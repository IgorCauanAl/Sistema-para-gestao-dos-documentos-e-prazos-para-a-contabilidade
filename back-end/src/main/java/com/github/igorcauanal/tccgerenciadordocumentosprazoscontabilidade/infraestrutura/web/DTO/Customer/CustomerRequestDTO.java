package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.Customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CustomerRequestDTO {

 @NotBlank(message = "O CNPJ é obrigatório")
 @Size(min = 14, max = 18, message = "O CNPJ deve ter entre 14 e 18 caracteres")
 private String cnpj;

 @NotBlank(message = "A razão social é obrigatória")
 @Size(min = 2, max = 100, message = "A razão social deve ter entre 2 e 100 caracteres")
 private String legalName;

 @NotBlank(message = "O e-mail é obrigatório")
 @Email(message = "Formato de e-mail inválido")
 private String email;

 @NotBlank(message = "O responsável é obrigatório")
 private String responsibleName;

 @NotBlank(message = "O endereço completo é obrigatório")
 private String fullAddress;
}