-- Este script migra os ativos da coluna de array na tabela 'grupos_de_ativos'
-- para linhas individuais na nova tabela 'grupo_ativos_relacao'.

-- Ele é projetado para ser idempotente, o que significa que pode ser executado
-- várias vezes sem criar entradas duplicadas, graças à cláusula ON CONFLICT.

INSERT INTO public.grupo_ativos_relacao (grupo_id, ativo)
SELECT
    g.id AS grupo_id,
    unnest(g.ativos) AS ativo
FROM
    public.grupos_de_ativos g
WHERE
    g.ativos IS NOT NULL AND array_length(g.ativos, 1) > 0
ON CONFLICT (grupo_id, ativo) DO NOTHING;

-- Mensagem de sucesso para o usuário no editor SQL.
SELECT 'Migração de ativos para a tabela relacional concluída com sucesso.' AS status;
