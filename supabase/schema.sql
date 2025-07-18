-- Garante que a coluna 'id' em 'grupos_de_ativos' seja uma chave primária.
-- Isso é necessário para criar a referência de chave estrangeira na tabela 'estrategias'.
ALTER TABLE public.grupos_de_ativos
ADD CONSTRAINT grupos_de_ativos_pkey PRIMARY KEY (id);

-- Tabela para armazenar as estratégias de manutenção
CREATE TABLE public.estrategias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grupo_id UUID NOT NULL,
    nome TEXT NOT NULL,
    prioridade TEXT NOT NULL CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA')),
    descricao TEXT,
    frequencia_valor INTEGER NOT NULL,
    frequencia_unidade TEXT NOT NULL CHECK (frequencia_unidade IN ('DIAS', 'SEMANAS', 'MESES', 'ANOS')),
    tolerancia_dias INTEGER,
    duracao_valor INTEGER NOT NULL,
    duracao_unidade TEXT NOT NULL CHECK (duracao_unidade IN ('HORAS', 'DIAS')),
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'ATIVA' CHECK (status IN ('ATIVA', 'INATIVA')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT fk_grupo_de_ativos
        FOREIGN KEY(grupo_id) 
        REFERENCES public.grupos_de_ativos(id)
        ON DELETE CASCADE
);

-- Habilita o RLS (Row Level Security)
ALTER TABLE public.estrategias ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Allow authenticated users to read strategies" ON public.estrategias
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to create strategies" ON public.estrategias
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update strategies" ON public.estrategias
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete strategies" ON public.estrategias
    FOR DELETE
    TO authenticated
    USING (true);

-- Trigger para atualizar o campo updated_at automaticamente
-- Primeiro, criamos a função
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Depois, criamos o trigger que usa a função
CREATE TRIGGER set_estrategias_timestamp
BEFORE UPDATE ON public.estrategias
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
