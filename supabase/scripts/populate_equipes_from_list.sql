-- Este script insere registros de equipes para várias combinações de centro de localização e fase,
-- usando as equipes do '1089' e 'PORTO' como modelo.
-- Ele evita a inserção de duplicatas se um registro para a mesma equipe,
-- centro de localização e fase já existir.

INSERT INTO equipes (centro_de_localizacao, fase, especialidade, hh, capacidade, diretoria_executiva, diretoria, unidade)
WITH
  -- 1. Defina explicitamente as combinações de centro de localização e fase de destino.
  target_locations (centro, fase) AS (
    VALUES
      ('1058', 'USINA'),
      ('1058', 'MINA'),
      ('1064', 'FERROVIA'),
      ('1068', 'PORTO'),
      ('1070', 'MINA'),
      ('1070', 'USINA'),
      ('1072', 'MINA'),
      ('1072', 'USINA'),
      ('1074', 'MINA'),
      ('1074', 'USINA'),
      ('1076', 'MINA'),
      ('1077', 'MINA'),
      ('1077', 'USINA'),
      ('1079', 'MINA'),
      ('1079', 'USINA'),
      ('1081', 'MINA'),
      ('1081', 'USINA'),
      ('1083', 'MINA'),
      ('1083', 'USINA'),
      ('1089', 'PORTO'),
      ('1090', 'PELOTIZAÇÃO'),
      ('1095', 'MINA'),
      ('1103', 'MINA'),
      ('1106', 'USINA'),
      ('1106', 'MINA'),
      ('1110', 'MINA'),
      ('1111', 'MINA'),
      ('1116', 'MINA'),
      ('1118', 'USINA'),
      ('1118', 'MINA'),
      ('1119', 'USINA'),
      ('1119', 'MINA'),
      ('1123', 'PORTO'),
      ('1133', 'PORTO'),
      ('4050', 'MINA'),
      ('4050', 'USINA'),
      ('4052', 'FERROVIA'),
      ('4056', 'FERROVIA'),
      ('4057', 'FERROVIA'),
      ('4058', 'FERROVIA'),
      ('4059', 'FERROVIA'),
      ('4064', 'FERROVIA'),
      ('4065', 'FERROVIA'),
      ('4069', 'FERROVIA'),
      ('4131', 'PORTO'),
      ('4143', 'MINA'),
      ('4144', 'MINA'),
      ('4181', 'PORTO'),
      ('4215', 'FERROVIA'),
      ('4217', 'FERROVIA'),
      ('4224', 'MINA'),
      ('4224', 'USINA'),
      ('4271', 'PORTO'),
      ('9041', 'MINA')
  ),
  -- 2. Selecione as equipes modelo que serão replicadas.
  template_teams AS (
    SELECT
      especialidade,
      hh,
      capacidade,
      diretoria_executiva,
      diretoria,
      unidade
    FROM
      equipes
    WHERE
      centro_de_localizacao = '1089' AND fase = 'PORTO'
  )
-- 3. Gere as linhas a serem inseridas combinando os locais de destino e as equipes modelo.
SELECT
  l.centro AS centro_de_localizacao,
  l.fase AS fase,
  t.especialidade,
  t.hh,
  t.capacidade,
  t.diretoria_executiva,
  t.diretoria,
  t.unidade
FROM
  target_locations l
CROSS JOIN
  template_teams t
ON CONFLICT (centro_de_localizacao, fase, especialidade) DO NOTHING;
