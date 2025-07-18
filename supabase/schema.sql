-- Cria um enum para as prioridades, garantindo a consistência dos dados.
CREATE TYPE prioridade_enum AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- Cria um enum para as unidades de frequência.
CREATE TYPE frequencia_unidade_enum AS ENUM ('DIAS', 'SEMANAS', 'MESES', 'ANOS');

-- Cria um enum para as unidades de duração.
CREATE TYPE duracao_unidade_enum AS ENUM ('HORAS', 'DIAS');

-- Cria um enum para os status da estratégia.
CREATE TYPE status_estrategia_enum AS ENUM ('ATIVA', 'INATIVA');

-- Tabela para armazenar as estratégias de manutenção associadas a um grupo de ativos.
CREATE TABLE IF NOT EXISTS public.estrategias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grupo_id UUID NOT NULL REFERENCES public.grupos_de_ativos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    prioridade prioridade_enum NOT NULL,
    frequencia_valor INT NOT NULL,
    frequencia_unidade frequencia_unidade_enum NOT NULL,
    tolerancia_dias INT DEFAULT 0,
    duracao_valor INT NOT NULL,
    duracao_unidade duracao_unidade_enum NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    ativa BOOLEAN NOT NULL DEFAULT true,
    status status_estrategia_enum NOT NULL DEFAULT 'ATIVA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adiciona um índice no campo grupo_id para otimizar as consultas que filtram por grupo.
CREATE INDEX IF NOT EXISTS idx_estrategias_grupo_id ON public.estrategias(grupo_id);

-- Adiciona RLS (Row Level Security) à tabela de estratégias
ALTER TABLE public.estrategias ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para a tabela 'estrategias'
-- Permite que usuários autenticados leiam todas as estratégias.
CREATE POLICY "Allow authenticated users to read strategies"
ON public.estrategias
FOR SELECT
TO authenticated
USING (true);

-- Permite que usuários autenticados criem novas estratégias.
CREATE POLICY "Allow authenticated users to create strategies"
ON public.estrategias
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permite que usuários autenticados atualizem estratégias.
CREATE POLICY "Allow authenticated users to update strategies"
ON public.estrategias
FOR UPDATE
TO authenticated
USING (true);

-- Permite que usuários autenticados excluam estratégias.
CREATE POLICY "Allow authenticated users to delete strategies"
ON public.estrategias
FOR DELETE
TO authenticated
USING (true);
