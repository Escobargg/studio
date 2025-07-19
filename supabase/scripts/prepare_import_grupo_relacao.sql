-- Passo 1: Remover a restrição de unicidade para permitir a importação de CSV com duplicatas.
-- Execute este script ANTES de importar seu arquivo CSV.

ALTER TABLE public.grupo_ativos_relacao
DROP CONSTRAINT IF EXISTS uq_grupo_ativo;

-- Agora, vá para a interface do Supabase e importe seu arquivo CSV para a tabela 'grupo_ativos_relacao'.
-- Após a importação ser concluída com sucesso, execute o script 'cleanup_import_grupo_relacao.sql'.
