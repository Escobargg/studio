-- supabase/migrations/20240729000000_create_paradas_table.sql

-- Tabela para armazenar as paradas de manutenção
CREATE TABLE IF NOT EXISTS public.paradas_de_manutencao (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    
    nome_parada text NOT NULL,
    descricao text,
    
    centro_de_localizacao text NOT NULL,
    fase text NOT NULL,
    
    -- Para saber se a parada é para um grupo ou ativo único
    tipo_selecao text NOT NULL CHECK (tipo_selecao IN ('grupo', 'ativo')), 
    
    -- Nome do grupo, se tipo_selecao for 'grupo'
    grupo_de_ativo text,
    
    -- Nome do ativo, se tipo_selecao for 'ativo'
    ativo text,
    
    -- Datas e horas planejadas
    inicio_planejado timestamp with time zone NOT NULL,
    fim_planejado timestamp with time zone NOT NULL,
    
    -- Datas e horas realizadas (opcionais)
    inicio_realizado timestamp with time zone,
    fim_realizado timestamp with time zone,
    
    -- Informações de recursos
    equipes integer,
    
    -- Status e progresso
    status text DEFAULT 'PLANEJADA', -- Ex: PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA
    conclusao numeric(5, 2) DEFAULT 0.00 -- Percentual de conclusão
);

-- Adiciona comentários para clareza
COMMENT ON TABLE public.paradas_de_manutencao IS 'Armazena informações sobre as paradas de manutenção planejadas e realizadas.';
COMMENT ON COLUMN public.paradas_de_manutencao.tipo_selecao IS 'Define se a parada se aplica a um grupo de ativos ou a um ativo individual.';
COMMENT ON COLUMN public.paradas_de_manutencao.conclusao IS 'Percentual de conclusão da parada, de 0 a 100.';


-- Habilita RLS (Row Level Security) para a tabela
ALTER TABLE public.paradas_de_manutencao ENABLE ROW LEVEL SECURITY;

-- Cria políticas de acesso
-- Permite que usuários autenticados leiam todas as paradas
CREATE POLICY "Allow authenticated read access"
ON public.paradas_de_manutencao
FOR SELECT
TO authenticated
USING (true);

-- Permite que usuários autenticados insiram, atualizem e excluam suas próprias paradas (exemplo, ajuste se necessário)
CREATE POLICY "Allow individual insert access"
ON public.paradas_de_manutencao
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow individual update access"
ON public.paradas_de_manutencao
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow individual delete access"
ON public.paradas_de_manutencao
FOR DELETE
TO authenticated
USING (true);
