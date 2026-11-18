package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.security.JWT;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.model.User.User;
import com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.dominio.ports.out.TokenServicePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;


@Service
public class TokenService implements TokenServicePort {

    private static final String ISSUER = "auth-api";

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration:7200000}")
    private long expirationMillis;

    @Override
    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            Instant now = Instant.now();

            return JWT.create()
                    .withIssuer(ISSUER)
                    // Subject = e-mail: chave usada pelo UserDetailsService.
                    .withSubject(user.getEmail())
                    .withClaim("name", user.getName())
                    .withIssuedAt(now)
                    .withExpiresAt(now.plusMillis(expirationMillis))
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new IllegalStateException("Erro ao gerar o token JWT", exception);
        }
    }

    @Override
    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer(ISSUER)
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            return "";
        }
    }
}
