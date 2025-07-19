-- Este script popula a tabela 'equipes' para várias combinações de centro de localização e fase,
-- usando as equipes do '1089 PORTO' e 'USINA' como modelo.
-- Ele usa uma lista explícita de locais de destino para garantir que todas as combinações sejam cobertas
-- e evita duplicatas usando ON CONFLICT DO NOTHING.

-- Passo 1: Definir as combinações de centro de localização e fase de destino.
WITH target_locations (centro_de_localizacao, fase) AS (
    VALUES
    ('1089 PORTO', 'USINA'),
    ('1089 PORTO', 'PELOTIZACAO'),
    ('1089 PORTO', 'PATIO DE PRODUTOS'),
    ('1089 PORTO', 'MANUTENCAO CENTRAL'),
    ('1228 EFVM', 'VIA PERMANENTE'),
    ('1228 EFVM', 'MATERIAL RODANTE'),
    ('1228 EFVM', 'OP. FERROVIARIA'),
    ('1091 MINA TIMBOPEBA', 'USINA'),
    ('1091 MINA TIMBOPEBA', 'MINA'),
    ('1091 MINA TIMBOPEBA', 'MANUTENCAO CENTRAL'),
    ('1090 MINA CONCEICAO', 'USINA'),
    ('1090 MINA CONCEICAO', 'MINA'),
    ('1090 MINA CONCEICAO', 'MANUTENCAO CENTRAL'),
    ('1094 MINA BRUCUTU', 'USINA'),
    ('1094 MINA BRUCUTU', 'MINA'),
    ('1094 MINA BRUCUTU', 'MANUTENCAO CENTRAL'),
    ('1092 MINAS CENTRAIS', 'USINA'),
    ('1092 MINAS CENTRAIS', 'MINA'),
    ('1092 MINAS CENTRAIS', 'MANUTENCAO CENTRAL'),
    ('1093 MINA FABRICA', 'USINA'),
    ('1093 MINA FABRICA', 'MINA'),
    ('1093 MINA FABRICA', 'MANUTENCAO CENTRAL'),
    ('1095 MINA VARGEM GRANDE', 'USINA'),
    ('1095 MINA VARGEM GRANDE', 'MINA'),
    ('1095 MINA VARGEM GRANDE', 'MANUTENCAO CENTRAL'),
    ('1101 MINA FABRICA NOVA', 'USINA'),
    ('1101 MINA FABRICA NOVA', 'MINA'),
    ('1101 MINA FABRICA NOVA', 'MANUTENCAO CENTRAL'),
    ('1102 pelotização', 'USINA 1'),
    ('1102 pelotização', 'USINA 2'),
    ('1102 pelotização', 'USINA 3'),
    ('1102 pelotização', 'USINA 4'),
    ('1102 pelotização', 'USINA 5'),
    ('1102 pelotização', 'USINA 6'),
    ('1102 pelotização', 'USINA 7'),
    ('1102 pelotização', 'USINA 8'),
    ('1099 MINA PICO', 'USINA'),
    ('1099 MINA PICO', 'MINA'),
    ('1099 MINA PICO', 'MANUTENCAO CENTRAL')
),
-- Passo 2: Selecionar as equipes do local modelo para serem replicadas.
model_equipes AS (
    SELECT especialidade, hh, capacidade
    FROM equipes
    WHERE centro_de_localizacao = '1089 PORTO' AND fase = 'USINA'
)
-- Passo 3: Inserir as equipes modelo em cada local de destino, evitando conflitos.
INSERT INTO equipes (centro_de_localizacao, fase, especialidade, hh, capacidade)
SELECT
    tl.centro_de_localizacao,
    tl.fase,
    me.especialidade,
    me.hh,
    me.capacidade
FROM target_locations tl
CROSS JOIN model_equipes me
-- Evita inserir se uma equipe com a mesma especialidade já existir para o centro/fase.
ON CONFLICT (centro_de_localizacao, fase, especialidade) DO NOTHING;
