
-- Políticas para a tabela 'grupos_de_ativos'
DROP POLICY IF EXISTS "Permitir acesso total para usuários autenticados em grupos_de_ativos" ON public.grupos_de_ativos;
CREATE POLICY "Permitir acesso total para usuários autenticados em grupos_de_ativos"
ON public.grupos_de_ativos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para a tabela 'estrategias'
DROP POLICY IF EXISTS "Permitir acesso total para usuários autenticados em estrategias" ON public.estrategias;
CREATE POLICY "Permitir acesso total para usuários autenticados em estrategias"
ON public.estrategias
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para a tabela 'paradas_de_manutencao'
DROP POLICY IF EXISTS "Permitir acesso total para usuários autenticados em paradas_de_manutencao" ON public.paradas_de_manutencao;
CREATE POLICY "Permitir acesso total para usuários autenticados em paradas_de_manutencao"
ON public.paradas_de_manutencao
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Políticas para a tabela 'recursos_parada'
DROP POLICY IF EXISTS "Permitir acesso total para usuários autenticados em recursos_parada" ON public.recursos_parada;
CREATE POLICY "Permitir acesso total para usuários autenticados em recursos_parada"
ON public.recursos_parada
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
