-- Adiciona uma nova coluna 'id_parada' que será um número sequencial.
-- O tipo BIGSERIAL cria automaticamente uma sequência e a define como o valor padrão para a nova coluna,
-- garantindo que ela seja auto-incrementada para cada nova linha.
ALTER TABLE public.paradas_de_manutencao
ADD COLUMN id_parada BIGSERIAL;

-- Opcional: Adicionar um índice na nova coluna para otimizar buscas futuras.
CREATE INDEX IF NOT EXISTS idx_id_parada ON public.paradas_de_manutencao(id_parada);
