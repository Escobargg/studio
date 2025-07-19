-- Tabela para armazenar as paradas de manutenção
CREATE TABLE IF NOT EXISTS public.paradas_de_manutencao (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    nome_parada text NOT NULL,
    centro_de_localizacao text NOT NULL,
    fase text NOT NULL,
    tipo_selecao text NOT NULL, -- 'grupo' ou 'ativo'
    grupo_de_ativos text,
    ativo_unico text,
    data_inicio_planejada timestamp with time zone NOT NULL,
    data_fim_planejada timestamp with time zone NOT NULL,
    duracao_planejada_horas integer,
    data_inicio_realizado timestamp with time zone,
    data_fim_realizado timestamp with time zone,
    duracao_realizada_horas integer,
    descricao text,
    status text NOT NULL DEFAULT 'PLANEJADA', -- Ex: PLANEJADA, EM ANDAMENTO, CONCLUÍDA, CANCELADA
    equipes_selecionadas jsonb, -- Armazena a lista de equipes e suas capacidades
    user_id uuid DEFAULT auth.uid(),
    CONSTRAINT paradas_de_manutencao_pkey PRIMARY KEY (id),
    CONSTRAINT paradas_de_manutencao_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL
);

-- Habilita a RLS (Row-Level Security) na tabela.
ALTER TABLE public.paradas_de_manutencao ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso:
-- 1. Permite que usuários autenticados leiam todas as paradas.
CREATE POLICY "Allow authenticated users to read all stops"
ON public.paradas_de_manutencao
FOR SELECT
TO authenticated
USING (true);

-- 2. Permite que usuários autenticados criem novas paradas.
CREATE POLICY "Allow authenticated users to create stops"
ON public.paradas_de_manutencao
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Permite que o criador da parada (ou um superusuário) a atualize.
--    Adicione `OR (get_my_claim('role') = 'admin')` se você tiver um sistema de roles.
CREATE POLICY "Allow creator to update their own stop"
ON public.paradas_de_manutencao
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Permite que o criador da parada (ou um superusuário) a exclua.
CREATE POLICY "Allow creator to delete their own stop"
ON public.paradas_de_manutencao
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
