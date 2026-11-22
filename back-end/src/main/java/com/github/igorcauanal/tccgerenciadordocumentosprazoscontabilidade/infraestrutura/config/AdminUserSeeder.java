package com.github.igorcauanal.tccgerenciadordocumentosprazoscontabilidade.infraestrutura.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Cria, opcionalmente, um usuário administrador em bancos novos.
 *
 * <p>A criação só acontece quando SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD estão
 * definidos. Isso permite subir a aplicação em outra máquina com um banco vazio
 * e já conseguir fazer login, sem fixar credenciais no código.</p>
 */
@Component
public class AdminUserSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserSeeder.class);
    private static final String ROLE_NAME = "CONTADOR";

    private final JdbcTemplate jdbcTemplate;

    @Value("${SEED_ADMIN_NAME:Administrador}")
    private String name;

    @Value("${SEED_ADMIN_EMAIL:}")
    private String email;

    @Value("${SEED_ADMIN_PASSWORD:}")
    private String password;

    public AdminUserSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return;
        }

        Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM app_user WHERE email = ?", Integer.class, email);
        if (existing != null && existing > 0) {
            logger.info("Usuário administrador '{}' já existe; seed ignorado.", email);
            return;
        }

        List<Long> roleIds = jdbcTemplate.queryForList(
                "SELECT id FROM role WHERE name = ?", Long.class, ROLE_NAME);
        if (roleIds.isEmpty()) {
            throw new IllegalStateException(
                    "Perfil " + ROLE_NAME + " não encontrado. Verifique as migrações do Flyway.");
        }

        String passwordHash = new BCryptPasswordEncoder().encode(password);

        jdbcTemplate.update(
                "INSERT INTO app_user (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                name, email, passwordHash, LocalDateTime.now());

        Long userId = jdbcTemplate.queryForObject(
                "SELECT id FROM app_user WHERE email = ?", Long.class, email);
        if (userId == null) {
            throw new IllegalStateException("Falha ao localizar o usuário administrador recém-criado.");
        }

        jdbcTemplate.update(
                "INSERT INTO user_profile (user_id, profile_id) VALUES (?, ?)",
                userId, roleIds.get(0));

        logger.info("Usuário administrador '{}' criado via SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD.", email);
    }
}
