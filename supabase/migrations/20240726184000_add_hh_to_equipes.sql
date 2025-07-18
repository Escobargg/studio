-- Adiciona a coluna 'hh' (Homem-Hora) à tabela 'equipes'
ALTER TABLE public.equipes
ADD COLUMN hh integer NOT NULL DEFAULT 8;

-- Preenche a nova coluna 'hh' com um valor padrão para registros existentes.
-- Você pode ajustar o valor '8' conforme necessário para seus dados.
UPDATE public.equipes
SET hh = 8
WHERE hh IS NULL;
