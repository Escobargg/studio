-- POLÍTICAS PARA A TABELA 'estrategias'

-- 1. Habilitar RLS (Row Level Security) para a tabela
alter table public.estrategias enable row level security;

-- 2. Permitir que usuários autenticados leiam todas as estratégias
-- Isso é útil para exibir informações em diferentes partes do aplicativo.
-- Se a leitura precisar ser restrita, ajuste a condição 'using'.
drop policy if exists "Allow authenticated users to read all strategies" on public.estrategias;
create policy "Allow authenticated users to read all strategies"
  on public.estrategias
  for select
  using ( auth.role() = 'authenticated' );

-- 3. Permitir que usuários autenticados criem novas estratégias
-- A política 'with check' garante que os dados inseridos são válidos e que o usuário está autenticado.
drop policy if exists "Allow authenticated users to create strategies" on public.estrategias;
create policy "Allow authenticated users to create strategies"
  on public.estrategias
  for insert
  with check ( auth.role() = 'authenticated' );

-- 4. Permitir que usuários autenticados atualizem estratégias
-- Normalmente, você adicionaria uma condição para garantir que o usuário só pode atualizar
-- as estratégias que ele criou (ex: using (auth.uid() = creator_id)),
-- mas para este caso, permitiremos a atualização de qualquer registro se autenticado.
drop policy if exists "Allow authenticated users to update strategies" on public.estrategias;
create policy "Allow authenticated users to update strategies"
  on public.estrategias
  for update
  using ( auth.role() = 'authenticated' );

-- 5. Permitir que usuários autenticados excluam estratégias
-- Semelhante à atualização, idealmente isso seria restrito ao criador do registro.
-- Por simplicidade, estamos permitindo que qualquer usuário autenticado exclua.
drop policy if exists "Allow authenticated users to delete strategies" on public.estrategias;
create policy "Allow authenticated users to delete strategies"
  on public.estrategias
  for delete
  using ( auth.role() = 'authenticated' );

-- POLÍTICAS PARA A TABELA 'grupos_de_ativos' (já existentes, mas incluídas para referência)

-- 1. Habilitar RLS
alter table public.grupos_de_ativos enable row level security;

-- 2. Permitir leitura para todos os usuários autenticados
drop policy if exists "Allow read access to all authenticated users" on public.grupos_de_ativos;
create policy "Allow read access to all authenticated users"
  on public.grupos_de_ativos
  for select
  using (auth.role() = 'authenticated');

-- 3. Permitir inserção para todos os usuários autenticados
drop policy if exists "Allow insert for all authenticated users" on public.grupos_de_ativos;
create policy "Allow insert for all authenticated users"
  on public.grupos_de_ativos
  for insert
  with check (auth.role() = 'authenticated');

-- 4. Permitir atualização para todos os usuários autenticados
drop policy if exists "Allow update for all authenticated users" on public.grupos_de_ativos;
create policy "Allow update for all authenticated users"
  on public.grupos_de_ativos
  for update
  using (auth.role() = 'authenticated');
  
-- 5. Permitir exclusão para todos os usuários autenticados
drop policy if exists "Allow delete for all authenticated users" on public.grupos_de_ativos;
create policy "Allow delete for all authenticated users"
  on public.grupos_de_ativos
  for delete
  using (auth.role() = 'authenticated');
