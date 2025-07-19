-- Drop a tabela existente se ela já existir para garantir uma recriação limpa.
DROP TABLE IF EXISTS public.recursos_parada;

-- Cria a tabela "recursos_parada" para armazenar as equipes alocadas para cada parada.
CREATE TABLE public.recursos_parada (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    parada_id uuid NOT NULL,
    equipe text NOT NULL,
    capacidade integer NOT NULL,
    hh numeric NOT NULL,
    hh_dia numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT recursos_parada_pkey PRIMARY KEY (id),
    CONSTRAINT recursos_parada_parada_id_fkey FOREIGN KEY (parada_id) REFERENCES paradas_de_manutencao(id) ON DELETE CASCADE
);

-- Habilita a Segurança em Nível de Linha (RLS) para a tabela.
ALTER TABLE public.recursos_parada ENABLE ROW LEVEL SECURITY;

-- Concede todas as permissões na tabela para o role 'anon' e 'authenticated'.
-- As políticas de RLS abaixo controlarão o acesso real.
GRANT ALL ON TABLE public.recursos_parada TO anon;
GRANT ALL ON TABLE public.recursos_parada TO authenticated;
GRANT ALL ON TABLE public.recursos_parada TO service_role;

-- Políticas de Segurança (RLS)

-- 1. Política de Inserção: Permite que usuários autenticados insiram recursos.
CREATE POLICY "Allow authenticated users to insert resources"
ON public.recursos_parada
FOR INSERT TO authenticated
WITH CHECK (true);

-- 2. Política de Seleção: Permite que usuários autenticados leiam os recursos.
CREATE POLICY "Allow authenticated users to select resources"
ON public.recursos_parada
FOR SELECT TO authenticated
USING (true);

-- 3. Política de Atualização: Permite que usuários autenticados atualizem os recursos.
CREATE POLICY "Allow authenticated users to update resources"
ON public.recursos_parada
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Política de Exclusão: Permite que usuários autenticados excluam os recursos.
CREATE POLICY "Allow authenticated users to delete resources"
ON public.recursos_parada
FOR DELETE TO authenticated
USING (true);
