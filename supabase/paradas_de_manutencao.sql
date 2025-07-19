
-- Criação da tabela para armazenar as paradas de manutenção
CREATE TABLE IF NOT EXISTS paradas_de_manutencao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_parada TEXT NOT NULL,
    centro_de_localizacao TEXT NOT NULL,
    fase TEXT NOT NULL,
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
    status TEXT NOT NULL DEFAULT 'PLANEJADA', -- Ex: PLANEJADA, EM_ANDAMENTO, CONCLUIDA, CANCELADA
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Habilitar Row Level Security
ALTER TABLE paradas_de_manutencao ENABLE ROW LEVEL SECURITY;
