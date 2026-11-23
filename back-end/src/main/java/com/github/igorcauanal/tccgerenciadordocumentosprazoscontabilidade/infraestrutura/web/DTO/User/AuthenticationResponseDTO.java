package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.web.DTO.User;

public class AuthenticationResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String token;
    private String perfil;
    private String dataReferencia;

    public AuthenticationResponseDTO() {
    }

    public AuthenticationResponseDTO(Long id, String name, String email, String token) {
        this(id, name, email, token, "Contador", null);
    }

    public AuthenticationResponseDTO(
            Long id,
            String name,
            String email,
            String token,
            String perfil,
            String dataReferencia
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.token = token;
        this.perfil = perfil;
        this.dataReferencia = dataReferencia;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }

    public String getDataReferencia() {
        return dataReferencia;
    }

    public void setDataReferencia(String dataReferencia) {
        this.dataReferencia = dataReferencia;
    }
}
