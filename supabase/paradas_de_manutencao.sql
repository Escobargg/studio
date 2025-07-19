-- Apaga a tabela antiga se ela existir
DROP TABLE IF EXISTS public.paradas_de_manutencao;

-- Cria a tabela para armazenar as paradas de manutenção
CREATE TABLE public.paradas_de_manutencao (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    nome_parada text NOT NULL,
    centro_de_localizacao text NOT NULL,
    fase text NOT NULL,
    tipo_selecao text NOT NULL,
    grupo_de_ativos text,
    ativo_unico text,
    data_inicio_planejada timestamp with time zone NOT NULL,
    data_fim_planejada timestamp with time zone NOT NULL,
    duracao_planejada_horas integer,
    data_inicio_realizado timestamp with time zone,
    data_fim_realizado timestamp with time zone,
    duracao_realizada_horas integer,
    descricao text,
    status text NOT NULL,
    equipes_selecionadas jsonb,
    user_id uuid NULL,
    CONSTRAINT paradas_de_manutencao_pkey PRIMARY KEY (id),
    CONSTRAINT paradas_de_manutencao_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ativa a Segurança em Nível de Linha (RLS)
ALTER TABLE public.paradas_de_manutencao ENABLE ROW LEVEL SECURITY;

-- Permite que usuários autenticados leiam todos os registros
CREATE POLICY "Allow authenticated users to read all stops"
ON public.paradas_de_manutencao
FOR SELECT
TO authenticated
USING (true);

-- Permite que usuários autenticados criem novos registros
CREATE POLICY "Allow authenticated users to create stops"
ON public.paradas_de_manutencao
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permite que usuários autenticados atualizem qualquer registro (ajuste se necessário)
CREATE POLICY "Allow authenticated users to update any stop"
ON public.paradas_de_manutencao
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permite que usuários autenticados excluam qualquer registro (ajuste se necessário)
CREATE POLICY "Allow authenticated users to delete any stop"
ON public.paradas_de_manutencao
FOR DELETE
TO authenticated
USING (true);