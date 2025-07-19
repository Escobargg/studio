
-- Habilita a Segurança a Nível de Linha (RLS) para a tabela de paradas.
-- Isso garante que as políticas abaixo sejam aplicadas.
ALTER TABLE public.paradas_de_manutencao ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes para evitar duplicação ou conflitos.
DROP POLICY IF EXISTS "Allow authenticated users to insert their own records" ON public.paradas_de_manutencao;
DROP POLICY IF EXISTS "Allow authenticated users to select their own records" ON public.paradas_de_manutencao;
DROP POLICY IF EXISTS "Allow authenticated users to update their own records" ON public.paradas_de_manutencao;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own records" ON public.paradas_de_manutencao;


-- CRIAÇÃO DAS POLÍTICAS

-- 1. Política de Inserção (INSERT)
-- Permite que qualquer usuário autenticado (logged in) possa criar novas paradas.
CREATE POLICY "Allow authenticated users to insert their own records"
ON public.paradas_de_manutencao
FOR INSERT
TO authenticated
WITH CHECK (true);


-- 2. Política de Seleção (SELECT)
-- Permite que qualquer usuário autenticado possa ler (visualizar) todas as paradas.
CREATE POLICY "Allow authenticated users to select their own records"
ON public.paradas_de_manutencao
FOR SELECT
TO authenticated
USING (true);


-- 3. Política de Atualização (UPDATE)
-- Permite que qualquer usuário autenticado possa atualizar qualquer parada.
-- Se a regra de negócio for mais restrita (ex: apenas quem criou pode editar),
-- a condição `USING` pode ser alterada para: (auth.uid() = user_id)
CREATE POLICY "Allow authenticated users to update their own records"
ON public.paradas_de_manutencao
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);


-- 4. Política de Exclusão (DELETE)
-- Permite que qualquer usuário autenticado possa excluir qualquer parada.
CREATE POLICY "Allow authenticated users to delete their own records"
ON public.paradas_de_manutencao
FOR DELETE
TO authenticated
USING (true);

