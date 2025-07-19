
-- Criação da tabela para armazenar os recursos alocados para cada parada
CREATE TABLE IF NOT EXISTS recursos_parada (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parada_id UUID NOT NULL REFERENCES paradas_de_manutencao(id) ON DELETE CASCADE,
    equipe TEXT,
    capacidade TEXT,
    hh TEXT,
    hh_dia TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Índice para acelerar a busca de recursos por parada
CREATE INDEX IF NOT EXISTS idx_recursos_parada_id ON recursos_parada(parada_id);

-- Habilitar Row Level Security
ALTER TABLE recursos_parada ENABLE ROW LEVEL SECURITY;
