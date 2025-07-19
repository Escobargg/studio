-- Passo 2: Limpar duplicatas e restaurar a restrição de unicidade.
-- Execute este script DEPOIS de importar seu arquivo CSV com sucesso.

-- Remove as linhas duplicadas, mantendo a primeira ocorrência (baseado no ctid, um identificador interno de linha).
DELETE FROM public.grupo_ativos_relacao a
WHERE a.ctid <> (
    SELECT min(b.ctid)
    FROM public.grupo_ativos_relacao b
    WHERE a.grupo_id = b.grupo_id AND a.ativo = b.ativo
);

-- Recria a restrição de unicidade para garantir a integridade dos dados daqui para frente.
ALTER TABLE public.grupo_ativos_relacao
ADD CONSTRAINT uq_grupo_ativo UNIQUE (grupo_id, ativo);

-- A importação está concluída e a tabela está limpa.
