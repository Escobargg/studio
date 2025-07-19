-- Tabela para armazenar os recursos alocados para cada parada de manutenção.
-- Cada linha representa uma equipe específica com sua capacidade e horas para uma parada.

CREATE TABLE IF NOT EXISTS public.recursos_parada (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    parada_id uuid NOT NULL,
    equipe text NULL,
    capacidade numeric NULL,
    hh numeric NULL,
    hh_dia numeric NULL,
    CONSTRAINT recursos_parada_pkey PRIMARY KEY (id),
    CONSTRAINT recursos_parada_parada_id_fkey FOREIGN KEY (parada_id) REFERENCES public.paradas_de_manutencao(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security
ALTER TABLE public.recursos_parada ENABLE ROW LEVEL SECURITY;

-- Explicar a tabela e suas colunas
COMMENT ON TABLE public.recursos_parada IS 'Armazena os recursos (equipes) alocados para cada parada de manutenção.';
COMMENT ON COLUMN public.recursos_parada.parada_id IS 'Vincula o recurso à parada de manutenção específica.';
COMMENT ON COLUMN public.recursos_parada.equipe IS 'A especialidade da equipe alocada (ex: MECANICA, ELETRICA).';
COMMENT ON COLUMN public.recursos_parada.capacidade IS 'O número de equipes daquela especialidade alocadas para a parada.';
COMMENT ON COLUMN public.recursos_parada.hh IS 'O valor de "Homem-Hora" para uma única equipe da especialidade.';
COMMENT ON COLUMN public.recursos_parada.hh_dia IS 'O total de horas-homem por dia (capacidade * hh).';

-- Garantir que a tabela pertence ao usuário postgres e que os usuários autenticados possam acessá-la via políticas
GRANT ALL ON TABLE public.recursos_parada TO postgres;
GRANT ALL ON TABLE public.recursos_parada TO service_role;
-- As políticas de RLS definirão o acesso para anon e authenticated.
