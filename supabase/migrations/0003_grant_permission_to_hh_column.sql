-- Concede permissão de SELECT na coluna "hh" para a role "anon"
GRANT SELECT (hh) ON TABLE public.equipes TO anon;

-- Concede permissão de SELECT na coluna "hh" para a role "authenticated"
GRANT SELECT (hh) ON TABLE public.equipes TO authenticated;

-- Se você estiver usando RLS, pode ser necessário recriar a política
-- para incluir a nova coluna na cláusula USING.
-- O comando abaixo é um exemplo. Adapte-o à sua política existente se necessário.

-- Primeiro, remova a política de select existente (substitua 'select_equipes_policy' pelo nome da sua política)
-- DROP POLICY IF EXISTS select_equipes_policy ON public.equipes;

-- Recrie a política garantindo que a verificação permita a leitura das colunas necessárias
-- CREATE POLICY "select_equipes_policy" ON public.equipes
-- FOR SELECT
-- USING (true);
