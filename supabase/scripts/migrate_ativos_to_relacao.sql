-- Este script migra os dados da coluna array 'ativos' na tabela 'grupos_de_ativos'
-- para a nova tabela relacional 'grupo_ativos_relacao'.
-- A função unnest() expande o array em um conjunto de linhas.

INSERT INTO public.grupo_ativos_relacao (grupo_id, ativo)
SELECT
    id as grupo_id,
    unnest(ativos) as ativo
FROM
    public.grupos_de_ativos
WHERE
    -- Garante que não tentamos desanexar um array nulo ou vazio.
    cardinality(ativos) > 0
ON CONFLICT (grupo_id, ativo) DO NOTHING;

-- Após executar este script e verificar que os dados foram migrados corretamente,
-- você pode remover a coluna 'ativos' da tabela 'grupos_de_ativos'
-- executando o script 'cleanup_old_ativos_column.sql'.
