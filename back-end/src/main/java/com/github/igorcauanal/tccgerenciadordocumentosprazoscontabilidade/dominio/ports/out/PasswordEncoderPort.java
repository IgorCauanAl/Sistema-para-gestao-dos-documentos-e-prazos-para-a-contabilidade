package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out;

public interface PasswordEncoderPort {

    boolean matches(String rawPassword, String encodedPassword);

    String encode(String rawPassword);
}
