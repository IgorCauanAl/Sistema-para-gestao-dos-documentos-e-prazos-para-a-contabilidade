# ContaDash — execução com Docker

Esta stack sobe o sistema completo (PostgreSQL + back-end Spring Boot + front-end Angular)
em qualquer máquina que tenha Docker e Docker Compose, sem precisar instalar Java, Node,
Maven ou PostgreSQL localmente.

## Pré-requisitos

- Docker 24+ com o plugin `docker compose` (ou Docker Compose v2)
- ~2 GB de espaço livre para as imagens e volumes

## Primeira execução

```bash
cp .env.example .env
```

Edite o `.env` e, no mínimo, troque:

- `DB_PASSWORD` — senha do banco
- `API_SECURITY_TOKEN_SECRET` — segredo dos tokens JWT (gere com `openssl rand -hex 32`)
- `SEED_ADMIN_PASSWORD` — senha do usuário administrador criado no primeiro boot

Depois:

```bash
docker compose up -d --build
```

Acompanhe a inicialização:

```bash
docker compose logs -f backend
```

Acesse:

- Aplicação: **http://localhost:4200**
- API (direto): **http://localhost:8080**

Na primeira inicialização, se `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` estiverem
preenchidos no `.env`, é criado um usuário com o perfil `CONTADOR`. Use esses dados
para entrar. Para não criar usuário algum, deixe uma dessas variáveis vazia.

O seed só cria o usuário quando o e-mail ainda não existe. Se você mudar
`SEED_ADMIN_PASSWORD` depois que o banco já foi criado, a senha antiga continua
valendo: para recomeçar do zero use `docker compose down -v` (isso apaga o banco
e os arquivos enviados).

## Rodando localmente (sem Docker)

Com Java 21, PostgreSQL e Node disponíveis na máquina, use o perfil `local` do back-end.
Ele fornece padrões de desenvolvimento para o banco (`localhost:5432`, `contadash`) e para
o segredo JWT, dispensando a exportação manual das variáveis:

```bash
# Terminar o back-end (porta 8080)
cd back-end
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Em outro terminal, subir o front-end (porta 4200)
cd front-end
npm install
npm start
```

O perfil `local` **não** deve ser usado em produção. O `application.yml` importa
automaticamente o `.env` da raiz (`../.env` ou `.env`) quando ele existe, então as
credenciais reais podem ficar apenas nesse arquivo, que é ignorado pelo Git. Para
sobrescrever qualquer valor, exporte a variável correspondente antes do comando
(por exemplo, `export API_SECURITY_TOKEN_SECRET=$(openssl rand -hex 32)`).
O banco precisa estar acessível em `DB_HOST:DB_PORT` com `DB_NAME/DB_USER/DB_PASSWORD`.

## Serviços

| Serviço   | Imagem base | Função | Porta no host |
|-----------|-------------|--------|---------------|
| `db`      | postgres:16-alpine | Banco de dados + migrações Flyway | não exposta |
| `backend` | eclipse-temurin:21 | API REST / autenticação JWT | `${BACKEND_PORT:-8080}` |
| `frontend`| nginx:1.27-alpine  | Build estático do Angular + proxy da API | `${FRONTEND_PORT:-4200}` |

O front-end usa URLs relativas (`/auth`, `/customers`, ...). O nginx as repassa para
o contêiner `backend`, então não é necessário configurar CORS para acessar pela
mesma origem. A variável `CORS_ALLOWED_ORIGINS` continua disponível caso a API seja
consumida por outra origem.

## Comandos úteis

```bash
# Status dos contêineres
docker compose ps

# Reiniciar apenas o back-end
docker compose restart backend

# Rebuild após alterar código
docker compose up -d --build

# Parar sem apagar dados
docker compose down

# Parar e apagar banco + arquivos enviados (DESTRUTIVO)
docker compose down -v
```

Os arquivos enviados pelo portal do cliente ficam no volume `documents_data` e o
banco no volume `postgres_data`. Ambos sobrevivem a `docker compose down`.

## Acessar de outra máquina na mesma rede

Por padrão, as portas são publicadas em todas as interfaces (`0.0.0.0`). Descubra o IP
da máquina que está rodando o Docker e acesse `http://IP_DA_MAQUINA:4200`.

Se quiser mudar as portas, edite `FRONTEND_PORT` e `BACKEND_PORT` no `.env` e rode
`docker compose up -d`. Se o front-end for servido em outra origem (por exemplo,
`http://IP_DA_MAQUINA:4200`), inclua essa URL em `CORS_ALLOWED_ORIGINS` no `.env`.

## Solução de problemas

- **`required variable ... is not set`**: o `.env` não foi criado ou está incompleto.
  Copie novamente de `.env.example`.
- **Back-end não fica saudável**: verifique `docker compose logs backend`. Erros comuns
  são segredo JWT ausente ou falha nas migrações Flyway.
- **`Could not resolve placeholder 'API_SECURITY_TOKEN_SECRET'` ao usar `mvnw spring-boot:run`**:
  o Maven não carrega o `.env` da raiz. Use `-Dspring-boot.run.profiles=local` ou exporte
  `API_SECURITY_TOKEN_SECRET` (e as variáveis `DB_*`) no shell antes de iniciar.
- **Erro 413 ao enviar arquivo**: o limite do nginx é 30 MB e o do back-end é 25 MB.
  Ajuste `client_max_body_size` em `front-end/docker/nginx.conf` e
  `PUBLIC_UPLOAD_MAX_BYTES`/`spring.servlet.multipart` se necessário.
- **Porta já em uso**: mude `FRONTEND_PORT` ou `BACKEND_PORT` no `.env`.
- **Quando o banco local já usa 5432**: não há conflito, pois a porta do Postgres não
  é publicada no host; ele só é acessível pela rede interna do Compose.
