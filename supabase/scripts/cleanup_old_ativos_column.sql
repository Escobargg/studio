-- ATENÇÃO: Execute este script somente DEPOIS de confirmar que o script
-- 'migrate_ativos_to_relacao.sql' foi executado com sucesso e que seus
-- dados de ativos foram corretamente populados na tabela 'grupo_ativos_relacao'.

-- Esta ação é irreversível.

-- Remove a coluna 'ativos' que não é mais necessária.
ALTER TABLE public.grupos_de_ativos
DROP COLUMN IF EXISTS ativos;
