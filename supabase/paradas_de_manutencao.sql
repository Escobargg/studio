-- Drop a tabela existente (se houver) para garantir uma recriação limpa.
-- CUIDADO: Isso apagará todos os dados existentes na tabela.
-- Comente a linha abaixo se quiser preservar os dados e apenas adicionar as novas colunas manualmente.
DROP TABLE IF EXISTS public.paradas_de_manutencao;

-- Cria a tabela para armazenar os dados das paradas de manutenção.
CREATE TABLE IF NOT EXISTS public.paradas_de_manutencao (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    nome_parada text,
    centro_de_localizacao text,
    fase text,
    tipo_selecao text,
    grupo_de_ativos text,
    ativo_unico text,
    data_inicio_planejada timestamp with time zone,
    data_fim_planejada timestamp with time zone,
    duracao_planejada_horas numeric,
    data_inicio_realizado timestamp with time zone,
    data_fim_realizado timestamp with time zone,
    duracao_realizada_horas numeric,
    equipes_selecionadas jsonb, -- Armazena as equipes e suas capacidades. Ex: [{"id": "uuid", "especialidade": "Mecânica", "capacidade": 2, "hh": 8, "total_hh": 16}]
    descricao text,
    status text DEFAULT 'PENDENTE', -- Ex: PENDENTE, EM_ANDAMENTO, CONCLUIDA, CANCELADA
    user_id uuid DEFAULT auth.uid(),

    CONSTRAINT paradas_de_manutencao_pkey PRIMARY KEY (id)
);

-- Ativa a Segurança de Nível de Linha (RLS) para a tabela.
ALTER TABLE IF EXISTS public.paradas_de_manutencao
    ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas (se existirem) para evitar conflitos.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.paradas_de_manutencao;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.paradas_de_manutencao;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.paradas_de_manutencao;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.paradas_de_manutencao;


-- Concede permissão de SELECT (leitura) a todos os usuários (anônimos e autenticados).
CREATE POLICY "Enable read access for all users"
    ON public.paradas_de_manutencao
    FOR SELECT
    USING (true);

-- Concede permissão de INSERT (criação) apenas para usuários autenticados.
CREATE POLICY "Enable insert for authenticated users only"
    ON public.paradas_de_manutencao
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Concede permissão de UPDATE (atualização) para os usuários que criaram o registro.
CREATE POLICY "Enable update for users based on user_id"
    ON public.paradas_de_manutencao
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Concede permissão de DELETE (exclusão) para os usuários que criaram o registro.
CREATE POLICY "Enable delete for users based on user_id"
    ON public.paradas_de_manutencao
    FOR DELETE
    USING (auth.uid() = user_id);
