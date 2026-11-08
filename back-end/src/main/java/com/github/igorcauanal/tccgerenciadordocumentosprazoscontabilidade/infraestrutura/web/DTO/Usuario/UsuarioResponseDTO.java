package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in.web.DTO.Usuario;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioResponseDTO {

    private Long id;
    private String nome;
    private String email;
    private PerfilResponseDTO perfil;

}
