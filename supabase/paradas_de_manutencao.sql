-- Tabela para armazenar as paradas de manutenção
CREATE TABLE IF NOT EXISTS public.paradas_de_manutencao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Informações Gerais
    nome_parada TEXT NOT NULL,
    centro_de_localizacao TEXT NOT NULL,
    fase TEXT NOT NULL,
    
    -- Seleção de Ativo/Grupo
    tipo_selecao TEXT NOT NULL, -- "grupo" ou "ativo"
    grupo_de_ativos TEXT,
    ativo TEXT,
    
    -- Planejamento
    data_inicio_planejada TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim_planejada TIMESTAMP WITH TIME ZONE NOT NULL,
    duracao_planejada_horas INT, -- Calculado e armazenado
    
    -- Realizado (Opcional)
    data_inicio_realizado TIMESTAMP WITH TIME ZONE,
    data_fim_realizado TIMESTAMP WITH TIME ZONE,
    duracao_realizada_horas INT, -- Calculado e armazenado
    
    -- Recursos
    equipes_selecionadas JSONB, -- Armazena um array de objetos: [{"id": "uuid", "especialidade": "Mecânica", "capacidade": 2, "hh": 8, "total_hh": 16}]
    
    -- Descrição
    descricao TEXT,

    -- Status e Conclusão
    status TEXT DEFAULT 'PLANEJADA' NOT NULL, -- Ex: PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA
    percentual_conclusao INT DEFAULT 0
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.paradas_de_manutencao ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Permite que usuários autenticados leiam todas as paradas
CREATE POLICY "Allow authenticated read access" ON public.paradas_de_manutencao
FOR SELECT USING (auth.role() = 'authenticated');

-- Permite que usuários autenticados criem novas paradas
CREATE POLICY "Allow authenticated insert access" ON public.paradas_de_manutencao
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permite que usuários autenticados atualizem paradas
CREATE POLICY "Allow authenticated update access" ON public.paradas_de_manutencao
FOR UPDATE USING (auth.role() = 'authenticated');

-- Permite que usuários autenticados excluam paradas
CREATE POLICY "Allow authenticated delete access" ON public.paradas_de_manutencao
FOR DELETE USING (auth.role() = 'authenticated');

-- Comentários para clareza
COMMENT ON TABLE public.paradas_de_manutencao IS 'Armazena informações sobre as paradas de manutenção planejadas e realizadas.';
COMMENT ON COLUMN public.paradas_de_manutencao.equipes_selecionadas IS 'Array JSON com as equipes selecionadas, suas capacidades e HH.';
