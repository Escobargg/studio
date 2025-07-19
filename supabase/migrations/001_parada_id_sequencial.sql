-- Remove a política de PRIMARY KEY da coluna `id`
ALTER TABLE public.paradas_de_manutencao DROP CONSTRAINT paradas_de_manutencao_pkey;

-- Altera o tipo da coluna para BIGINT
ALTER TABLE public.paradas_de_manutencao ALTER COLUMN id TYPE BIGINT;

-- Cria uma nova sequência
CREATE SEQUENCE IF NOT EXISTS public.paradas_de_manutencao_id_seq;

-- Define o valor padrão da coluna id para usar a sequência
ALTER TABLE public.paradas_de_manutencao ALTER COLUMN id SET DEFAULT nextval('public.paradas_de_manutencao_id_seq');

-- Define o próximo valor da sequência com base no maior id existente
-- Isso evita conflitos se já existirem dados na tabela
SELECT setval('public.paradas_de_manutencao_id_seq', (SELECT MAX(id) FROM public.paradas_de_manutencao));

-- Define a coluna 'id' como a nova PRIMARY KEY
ALTER TABLE public.paradas_de_manutencao ADD PRIMARY KEY (id);
