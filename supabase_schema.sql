-- Script para criar a tabela de grupos de ativos
CREATE TABLE public.grupos_de_ativos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  nome_grupo text NOT NULL,
  tipo_grupo text,
  diretoria_executiva text,
  diretoria text,
  unidade text,
  centro_de_localizacao text,
  fase text,
  categoria text,
  ativos text[] -- Usando um array de texto para armazenar a lista de ativos
);

-- Ativa a segurança em nível de linha (RLS) para a nova tabela
-- Para mais informações sobre RLS: https://supabase.com/docs/guides/auth/row-level-security
ALTER TABLE public.grupos_de_ativos ENABLE ROW LEVEL SECURITY;

-- Cria uma política que permite acesso público de leitura (SELECT) na tabela.
-- Qualquer pessoa pode ver os grupos criados.
CREATE POLICY "Public can read all groups" ON public.grupos_de_ativos
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Cria uma política que permite acesso de inserção (INSERT) para qualquer usuário (público/anônimo).
-- Qualquer pessoa pode criar novos grupos.
CREATE POLICY "Public can create groups" ON public.grupos_de_ativos
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- Adiciona comentários para descrever a tabela e as colunas.
COMMENT ON TABLE public.grupos_de_ativos IS 'Armazena os grupos de ativos criados através do formulário.';
COMMENT ON COLUMN public.grupos_de_ativos.id IS 'Identificador único do grupo (Chave Primária).';
COMMENT ON COLUMN public.grupos_de_ativos.created_at IS 'Data e hora de criação do registro.';
COMMENT ON COLUMN public.grupos_de_ativos.nome_grupo IS 'Nome definido pelo usuário para o grupo de ativos.';
COMMENT ON COLUMN public.grupos_de_ativos.tipo_grupo IS 'Tipo do grupo (Ex: Frota, Rota).';
COMMENT ON COLUMN public.grupos_de_ativos.diretoria_executiva IS 'Nível hierárquico selecionado.';
COMMENT ON COLUMN public.grupos_de_ativos.diretoria IS 'Nível hierárquico selecionado.';
COMMENT ON COLUMN public.grupos_de_ativos.unidade IS 'Nível hierárquico selecionado.';
COMMENT ON COLUMN public.grupos_de_ativos.centro_de_localizacao IS 'Nível hierárquico selecionado.';
COMMENT ON COLUMN public.grupos_de_ativos.fase IS 'Nível hierárquico selecionado.';
COMMENT ON COLUMN public.grupos_de_ativos.categoria IS 'Categoria selecionada para os ativos.';
COMMENT ON COLUMN public.grupos_de_ativos.ativos IS 'Lista dos ativos selecionados para o grupo.';
