-- Este script desativa a segurança em nível de linha (RLS) para as tabelas especificadas,
-- permitindo todas as operações (SELECT, INSERT, UPDATE, DELETE) para o role 'public' (anônimo).
-- ATENÇÃO: Use isso apenas para desenvolvimento. NÃO use em produção sem políticas de segurança adequadas.

-- Habilita RLS e cria políticas "public" para a tabela 'grupos_de_ativos'
ALTER TABLE public.grupos_de_ativos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for all operations on grupos_de_ativos" ON public.grupos_de_ativos;
CREATE POLICY "Public access for all operations on grupos_de_ativos"
ON public.grupos_de_ativos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Habilita RLS e cria políticas "public" para a tabela 'ativos'
ALTER TABLE public.ativos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for all operations on ativos" ON public.ativos;
CREATE POLICY "Public access for all operations on ativos"
ON public.ativos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Habilita RLS e cria políticas "public" para a tabela 'hierarquia'
ALTER TABLE public.hierarquia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access for all operations on hierarquia" ON public.hierarquia;
CREATE POLICY "Public access for all operations on hierarquia"
ON public.hierarquia
FOR ALL
TO public
USING (true)
WITH CHECK (true);
