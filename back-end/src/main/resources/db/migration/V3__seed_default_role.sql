-- Perfil usado pelas regras de autorização da aplicação (SecurityRoles.CONTADOR).
-- Necessário para que um banco recém-criado já tenha o papel padrão.
INSERT INTO role (name, description)
VALUES ('CONTADOR', 'Contador responsável pelo sistema')
ON CONFLICT (name) DO NOTHING;
