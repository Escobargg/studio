-- Apaga a tabela existente se ela existir, para garantir um recomeço limpo
DROP TABLE IF EXISTS public.paradas_de_manutencao;

-- Cria a tabela paradas_de_manutencao
CREATE TABLE public.paradas_de_manutencao (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    nome_parada text NOT NULL,
    centro_de_localizacao text,
    fase text,
    tipo_selecao text,
    grupo_de_ativos text,
    ativo_unico text,
    data_inicio_planejada timestamp with time zone,
    data_fim_planejada timestamp with time zone,
    duracao_planejada_horas integer,
    data_inicio_realizado timestamp with time zone,
    data_fim_realizado timestamp with time zone,
    duracao_realizada_horas integer,
    descricao text,
    status text,
    equipes_selecionadas jsonb, -- Alterado para JSONB para armazenar objetos complexos
    user_id uuid,
    CONSTRAINT paradas_de_manutencao_pkey PRIMARY KEY (id)
);

-- Habilita a segurança em nível de linha
ALTER TABLE public.paradas_de_manutencao ENABLE ROW LEVEL SECURITY;

-- Concede permissões para todos os usuários autenticados
-- Permissão para selecionar (ler) todas as paradas
CREATE POLICY "Allow all authenticated users to read stops"
ON public.paradas_de_manutencao
FOR SELECT
TO authenticated
USING (true);

-- Permissão para inserir (criar) novas paradas
CREATE POLICY "Allow all authenticated users to create stops"
ON public.paradas_de_manutencao
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permissão para atualizar (editar) paradas que o usuário criou
CREATE POLICY "Allow users to update their own stops"
ON public.paradas_de_manutencao
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Permissão para deletar paradas que o usuário criou
CREATE POLICY "Allow users to delete their own stops"
ON public.paradas_de_manutencao
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
