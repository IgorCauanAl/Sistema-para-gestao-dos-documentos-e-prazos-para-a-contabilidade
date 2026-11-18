package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.in;

import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.AuthenticatedUser;

public interface AuthenticateServicePort {

    AuthenticatedUser authenticate(String email, String password);

}
