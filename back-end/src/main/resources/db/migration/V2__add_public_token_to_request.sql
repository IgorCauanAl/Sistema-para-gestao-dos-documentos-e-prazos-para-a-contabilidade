-- Link público do portal do cliente: apenas o hash SHA-256 é persistido.
-- A coluna é nullable para preservar solicitações legadas criadas sem link público.
ALTER TABLE request
    ADD COLUMN public_token_hash VARCHAR(64);

CREATE UNIQUE INDEX uq_request_public_token_hash ON request (public_token_hash);

-- Flag de validação do arquivo recebido pelo portal (RNF06/RNF07).
ALTER TABLE document
    ADD COLUMN verified BOOLEAN NOT NULL DEFAULT TRUE;
