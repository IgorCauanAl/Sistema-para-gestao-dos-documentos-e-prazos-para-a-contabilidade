---
apply: always
---

# Contexto e Regras do Projeto — Sistema de Gestão Contábil (MVP)

## 1. Visão Geral e Objetivo
Desenvolvimento do MVP de um **Sistema de Gestão Contábil Web** focado em pequenos escritórios de contabilidade. O sistema centraliza a comunicação, controla prazos legais e automatiza a coleta e envio de documentos entre o contador e seus clientes, garantindo conformidade com a **LGPD** e alta eficiência operacional.

---

## 2. Stack Tecnológica e Arquitetura
- **Arquitetura Backend:** **Arquitetura Hexagonal (Ports & Adapters)**.
    - **Domínio (`domain`):** Regras de negócio puras, entidades, objetos de valor e portas (interfaces). **Proibido** importar dependências de frameworks (`org.springframework.*`, Jakarta Persistence/JPA annotations, etc.) no núcleo do domínio.
    - **Aplicação (`application`):** Casos de uso (Use Cases) orquestrando o domínio através das portas.
    - **Infraestrutura (`infrastructure` / `adapters`):** Controllers REST, Spring Security, persistência JPA/PostgreSQL, armazenamento de arquivos, envio de e-mails e integrações externas.
- **Backend:** Java, Spring Boot, Spring Security, PostgreSQL.
- **Versionamento de Banco:** **Flyway** (toda alteração de schema exige um novo script de migração SQL versionado).
- **Frontend:** Angular (TypeScript).

---

## 3. Requisitos Funcionais (Módulos e Regras de Negócio)

### RF01 — Autenticação e Navegação
- Login exclusivo para o **Contador** via e-mail e senha.
- Todas as rotas internas são bloqueadas para usuários não autenticados.
- **Rotas públicas:** Apenas tela de login e links de acesso enviados aos clientes (validados por token).
- **Menu superior:** Links rápidos para `Dashboard`, `Clientes`, `Documentos`, `Prazos` e `Solicitações`.

### RF02 — Dashboard (Visão Geral)
Exibir indicadores resumidos de carregamento rápido:
- **Total de Clientes** cadastrados.
- **Docs. Pendentes** (aguardando ação/envio do cliente).
- **Obrigações Atrasadas** (necessitam de revisão imediata).

### RF03 — Clientes (Base Cadastral)
- **Listagem:** Exibir Razão Social, CNPJ, Responsável, E-mail, Status de Pendências e Data do Último Envio.
- **Cadastro (Modal "Novo Cliente"):** CNPJ, Razão Social, Responsável, E-mail corporativo e Endereço Completo.
- **Ações:** Edição dos dados cadastrais e exclusão do cliente do portfólio (com confirmação obrigatória).

### RF04 — Documentos (Gestão e Envio)
- **Upload (Modal):** Suportar apenas os formatos `PDF`, `OFX`, `XML`, `XLSX`, `CSV` e `TXT`.
- **Metadados no envio:** Tipo do documento, Competência, Data de vencimento (opcional) e Canal de envio.
- **Ciclo de vida (Status):** Rastrear obrigatoriamente os estados `Criado` → `Enviado` → `Visualizado` → `Baixado`.
- **Visualização e Filtros:** Abas para alternar entre `Todos`, `Enviados ao cliente` e `Recebidos do cliente`.
- **Ações na listagem:** Atalhos para **Visualizar** e **Baixar** o arquivo.

### RF05 — Solicitações (Coleta de Dados do Cliente)
- **Criação:** Exigir Cliente, Título, Competência, Prazo para envio e montagem de um **Checklist de itens** (definindo o formato de arquivo esperado para cada item).
- **Fluxo do Cliente (Portal Público):** Ao fazer upload de um item, o status do item muda automaticamente para `Enviado pelo cliente`.
- **Conferência do Contador:** Itens com status `Enviado pelo cliente` liberam os botões `Aceitar` ou `Recusar`.
- **Progresso:** Calcular automaticamente a barra de **Progresso da conferência** com base na proporção de itens aprovados (`Aceitos` / `Total de itens`).

### RF06 — Prazos (Fluxo Básico)
- **Tabela principal:** Exibir Cliente, Obrigação, Categoria, Competência, Vencimento, Prioridade, Etapa Atual e Status.
- **Painel de detalhes:** Botão `Marcar como entregue` que abre uma tela/modal de confirmação antes de concluir a transição de estado.

---

## 4. Requisitos Não Funcionais e Guardrails de Engenharia

### Segurança e LGPD (Obrigatório em todo código gerado)
- **RNF01 (Tokens):** Gerar tokens de links públicos com no mínimo **128 bits** usando gerador criptograficamente seguro (`SecureRandom`).
- **RNF02 (Senhas):** Armazenar senhas exclusivamente com **BCrypt**. **Nunca** registrar senhas, tokens ou dados sensíveis em logs.
- **RNF03 (Transporte):** HTTPS obrigatório em todas as rotas (internas e públicas).
- **RNF04 (Sessão e Web Security):** Proteção ativa contra CSRF, XSS e SQL Injection. Cookies de sessão configurados com `HttpOnly`, `Secure` e `SameSite`.
- **RNF05 (Rotas Públicas):** Implementar Rate Limiting (limite de tentativas) e limite de tamanho de requisição nos endpoints públicos.
- **RNF06 (Storage Seguro):** Salvar arquivos fora do diretório público da aplicação, renomeados com identificadores aleatórios (UUID). Servir arquivos apenas após validação de permissão/token e via **URLs assinadas temporárias**.
- **RNF07 (Isolamento de Dados):** Garantir isolamento estrito entre clientes em todas as queries (um cliente jamais pode acessar dados/arquivos de outro). Sempre gerar testes automatizados validando tentativas de acesso cruzado (IDOR).
- **RNF08 (Segredos):** Nunca hardcodar credenciais (banco, SMTP, chaves de assinatura) no código-fonte; usar variáveis de ambiente.
- **RNF09 (Auditoria Imutável):** Registros de log de auditoria devem ser *append-only* (sem endpoints ou métodos de `UPDATE` ou `DELETE` expostos para usuários).

### Desempenho, I/O e Confiabilidade
- **RNF10 (Latência):** Listagens e painéis devem responder em até **2 segundos** (usar paginação, projeções/DTOs otimizados e índices adequados no PostgreSQL).
- **RNF11 (Streaming de Arquivos):** Upload e download devem ser processados via **fluxo (Streams)** sem carregar o arquivo inteiro na memória RAM. Implementar barra de progresso no Angular. Tamanho máximo configurável via propriedade (padrão inicial: **25 MB**).
- **RNF13 (Backup):** Manter estrutura de storage e banco desacoplada e compatível com rotinas diárias de backup e restauração.

### Frontend Angular, Usabilidade e Acessibilidade
- **RNF16 (Responsividade):**
    - **Painel do Contador:** Responsivo para desktop, notebook e tablet.
    - **Página Pública do Cliente:** Projetada **mobile-first**, totalmente funcional a partir de **360px** de largura.
- **RNF17 (Acessibilidade):** Garantir contraste adequado, foco visível na navegação por teclado, `<label>` associado a todos os campos de formulário e fechamento de todos os modais ao pressionar a tecla **`ESC`**.
- **RNF18 (Feedback e Segurança de UX):** Exibir feedback visual claro (toasts/alertas) para sucesso e erro em todas as ações, e exigir **modal de confirmação** antes de qualquer ação destrutiva (excluir cliente, recusar documento, marcar obrigação como entregue).
- **RNF19 (Compatibilidade):** Compatível com versões atuais de Chrome, Edge, Firefox, Safari e navegadores móveis Android/iOS.

---

## 5. Instruções de Resposta para a IA
- Ao criar novas entidades ou alterar tabelas, gere sempre a migration correspondente do **Flyway** (`V{numero}__{descricao}.sql`).
- Ao implementar endpoints de upload/download no Spring e Angular, utilize streaming (`InputStream` / `StreamingResponseBody` / `HttpEventType.UploadProgress`) respeitando o RNF11.
- Sempre sugira ou inclua testes de unidade para regras de domínio e testes de integração validando o isolamento de acesso entre clientes (RNF07).