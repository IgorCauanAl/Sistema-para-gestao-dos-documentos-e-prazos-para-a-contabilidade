-- Normaliza CNPJs legados para o formato 00.000.000/0000-00.
-- A aplicação já grava e valida nesse formato; esta migração alinha dados antigos.
UPDATE customer
SET cnpj = regexp_replace(cnpj, '\D', '', 'g')
WHERE cnpj IS NOT NULL
  AND cnpj <> regexp_replace(cnpj, '\D', '', 'g');

UPDATE customer
SET cnpj = substr(regexp_replace(cnpj, '\D', '', 'g'), 1, 2) || '.' ||
           substr(regexp_replace(cnpj, '\D', '', 'g'), 3, 3) || '.' ||
           substr(regexp_replace(cnpj, '\D', '', 'g'), 6, 3) || '/' ||
           substr(regexp_replace(cnpj, '\D', '', 'g'), 9, 4) || '-' ||
           substr(regexp_replace(cnpj, '\D', '', 'g'), 13, 2)
WHERE cnpj IS NOT NULL
  AND length(regexp_replace(cnpj, '\D', '', 'g')) = 14
  AND cnpj !~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$';
