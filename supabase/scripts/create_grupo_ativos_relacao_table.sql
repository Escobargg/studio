-- Cria a nova tabela para armazenar a relação entre grupos e ativos.
-- Esta estrutura é mais normalizada, com cada ativo de um grupo em sua própria linha.
CREATE TABLE IF NOT EXISTS public.grupo_ativos_relacao (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    grupo_id uuid NOT NULL,
    ativo text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT grupo_ativos_relacao_pkey PRIMARY KEY (id),
    CONSTRAINT grupo_ativos_relacao_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos_de_ativos(id) ON DELETE CASCADE,
    CONSTRAINT uq_grupo_ativo UNIQUE (grupo_id, ativo) -- Garante que um ativo não pode ser adicionado duas vezes ao mesmo grupo
);

-- Adiciona comentários para documentação da tabela e colunas.
COMMENT ON TABLE public.grupo_ativos_relacao IS 'Armazena a relação individual entre um grupo e um de seus ativos.';
COMMENT ON COLUMN public.grupo_ativos_relacao.id IS 'Chave primária única para a relação.';
COMMENT ON COLUMN public.grupo_ativos_relacao.grupo_id IS 'Referência (FK) ao ID do grupo na tabela grupos_de_ativos.';
COMMENT ON COLUMN public.grupo_ativos_relacao.ativo IS 'O identificador do ativo (ex: código do equipamento) associado ao grupo.';
COMMENT ON COLUMN public.grupo_ativos_relacao.created_at IS 'Timestamp de quando a relação foi criada.';

-- Habilita a Segurança de Nível de Linha (RLS) para a nova tabela.
-- É uma boa prática de segurança começar com a RLS ativada.
ALTER TABLE public.grupo_ativos_relacao ENABLE ROW LEVEL SECURITY;

-- Cria políticas de acesso básicas.
-- Esta política permite que qualquer usuário autenticado realize todas as operações (select, insert, update, delete).
-- ATENÇÃO: Para produção, você deve criar políticas mais restritivas.
CREATE POLICY "Enable all access for authenticated users"
ON public.grupo_ativos_relacao
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Garante que o dono da tabela (e o superusuário) tenham todos os privilégios.
GRANT ALL ON TABLE public.grupo_ativos_relacao TO postgres;
GRANT ALL ON TABLE public.grupo_ativos_relacao TO service_role;
GRANT ALL ON TABLE public.grupo_ativos_relacao TO authenticated;
GRANT ALL ON TABLE public.grupo_ativos_relacao TO anon;
