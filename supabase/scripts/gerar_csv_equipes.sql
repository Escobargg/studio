-- Este script gera o conteúdo para um arquivo CSV.
-- Ele combina as equipes do '1089-Porto' com todas as outras combinações de centro/fase.
-- Execute este script no SQL Editor do Supabase e use o botão "Download CSV" no resultado.

WITH 
  -- 1. Obter todas as combinações únicas de centro de localização e fase da tabela de hierarquia
  localidades AS (
    SELECT DISTINCT 
      centro_de_localizacao, 
      fase
    FROM 
      public.hierarquia
  ),
  -- 2. Obter as equipes "modelo" que serão replicadas
  equipes_modelo AS (
    SELECT 
      especialidade, 
      hh, 
      capacidade
    FROM 
      public.equipes
    WHERE 
      centro_de_localizacao = '1089-Porto'
  )
-- 3. Gerar as linhas do CSV combinando cada localidade com cada equipe modelo
SELECT 
  l.centro_de_localizacao,
  l.fase,
  em.especialidade,
  em.hh,
  em.capacidade
FROM 
  localidades l
CROSS JOIN 
  equipes_modelo em
-- 4. Opcional: Excluir os registros que já existem para evitar redundância no CSV.
--    A funcionalidade de importação do Supabase geralmente lida com isso, mas é uma boa prática.
LEFT JOIN 
  public.equipes e 
  ON l.centro_de_localizacao = e.centro_de_localizacao 
  AND l.fase = e.fase 
  AND em.especialidade = e.especialidade
WHERE 
  e.id IS NULL
ORDER BY
  l.centro_de_localizacao,
  l.fase,
  em.especialidade;
