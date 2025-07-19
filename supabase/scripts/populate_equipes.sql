-- Este script popula a tabela `equipes` com as equipes do '1089-Porto' para todas as outras
-- combinações de centro de localização e fase existentes na tabela `hierarquia`.
-- Ele é seguro para ser executado várias vezes, pois não criará duplicatas.

-- Adicione a restrição de unicidade se ela ainda não existir.
-- Isso é crucial para o `ON CONFLICT` funcionar corretamente.
-- Você pode receber um aviso se a restrição já existir, o que é seguro ignorar.
ALTER TABLE public.equipes
ADD CONSTRAINT equipes_unique_constraint UNIQUE (centro_de_localizacao, fase, especialidade);

-- Insere os registros, ignorando quaisquer conflitos (duplicatas).
INSERT INTO public.equipes (centro_de_localizacao, fase, especialidade, hh, capacidade)
WITH
  -- 1. Pega todas as combinações únicas de local e fase da tabela de hierarquia.
  locais_fases AS (
    SELECT DISTINCT centro_de_localizacao, fase
    FROM public.hierarquia
  ),
  -- 2. Pega as equipes que servirão como modelo (template) do '1089-Porto'.
  equipes_template AS (
    SELECT especialidade, hh, capacidade
    FROM public.equipes
    WHERE centro_de_localizacao = '1089-Porto'
  )
-- 3. Gera todos os registros de equipe desejados combinando os locais/fases com as equipes modelo.
SELECT
  lf.centro_de_localizacao,
  lf.fase,
  et.especialidade,
  et.hh,
  et.capacidade
FROM
  locais_fases lf
CROSS JOIN
  equipes_template et
-- 4. Tenta inserir e ignora silenciosamente se a combinação já existir, graças à restrição UNIQUE.
ON CONFLICT (centro_de_localizacao, fase, especialidade) DO NOTHING;
