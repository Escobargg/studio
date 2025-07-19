
-- Tabela para armazenar as paradas de manutenção
CREATE TABLE IF NOT EXISTS paradas_de_manutencao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    nome_parada TEXT NOT NULL,
    centro_de_localizacao TEXT,
    fase TEXT,
    tipo_selecao TEXT NOT NULL, -- 'grupo' ou 'ativo'
    grupo_de_ativos TEXT,
    ativo_unico TEXT,
    data_inicio_planejada TIMESTAMPTZ NOT NULL,
    data_fim_planejada TIMESTAMPTZ NOT NULL,
    duracao_planejada_horas INT,
    data_inicio_realizado TIMESTAMPTZ,
    data_fim_realizado TIMESTAMPTZ,
    duracao_realizada_horas INT,
    descricao TEXT,
    status TEXT DEFAULT 'PLANEJADA', -- Ex: PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA
    equipes_selecionadas JSONB, -- Armazena as equipes e suas capacidades
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Políticas de Segurança
-- Habilita RLS
ALTER TABLE public.paradas_de_manutencao ENABLE ROW LEVEL SECURITY;

-- Permite que usuários autenticados criem suas próprias paradas
CREATE POLICY "Allow authenticated users to create stops"
ON public.paradas_de_manutencao
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permite que usuários vejam todas as paradas (somente leitura)
CREATE POLICY "Allow authenticated users to view all stops"
ON public.paradas_de_manutencao
FOR SELECT
TO authenticated
USING (true);

-- Permite que o criador da parada a atualize
CREATE POLICY "Allow owner to update their own stop"
ON public.paradas_de_manutencao
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Permite que o criador da parada a exclua
CREATE POLICY "Allow owner to delete their own stop"
ON public.paradas_de_manutencao
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

    