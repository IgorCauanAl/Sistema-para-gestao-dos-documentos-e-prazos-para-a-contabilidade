package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.portas.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.modelo.User.AuthenticatedUser;

public interface AuthenticateServicePort {

    AuthenticatedUser authenticate(String email, String password);

}
