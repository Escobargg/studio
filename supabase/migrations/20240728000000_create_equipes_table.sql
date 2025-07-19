-- supabase/migrations/20240728000000_create_equipes_table.sql

CREATE TABLE equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    especialidade TEXT NOT NULL,
    centro_de_localizacao TEXT NOT NULL,
    fase TEXT NOT NULL,
    
    -- Opcional: Adicionar chaves estrangeiras para garantir a integridade referencial
    -- FOREIGN KEY (centro_de_localizacao) REFERENCES hierarquia(centro_de_localizacao),
    -- FOREIGN KEY (fase) REFERENCES hierarquia(fase)

    -- Garante que cada combinação de especialidade, centro e fase é única
    UNIQUE(especialidade, centro_de_localizacao, fase)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Permitir leitura para todos os usuários autenticados
CREATE POLICY "Allow read access to all authenticated users"
ON equipes
FOR SELECT
TO authenticated
USING (true);

-- Permitir inserção apenas para service_role (geralmente do backend ou ambiente seguro)
CREATE POLICY "Allow insert for service_role"
ON equipes
FOR INSERT
TO service_role
WITH CHECK (true);

-- Exemplo de inserção de dados:
-- Lembre-se de substituir pelos seus dados reais.
INSERT INTO equipes (especialidade, centro_de_localizacao, fase) VALUES
('MECANICA', '2001 - Mina Carajás', 'MINA'),
('ELETRICA', '2001 - Mina Carajás', 'MINA'),
('INSTRUMENTACAO', '2001 - Mina Carajás', 'USINA'),
('MECANICA', '3050 - Usina Vitória', 'USINA'),
('ELETRICA', '3050 - Usina Vitória', 'USINA');

-- Nota: Para aplicar este script, você pode copiar o conteúdo para o SQL Editor no seu dashboard Supabase ou
-- usar a CLI do Supabase para aplicar a migração.
