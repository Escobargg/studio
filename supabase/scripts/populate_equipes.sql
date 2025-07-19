-- Este script popula a tabela 'equipes' com base nos dados existentes para '1089-Porto'.
-- Ele replica as equipes de '1089-Porto' para todas as outras combinações únicas de 
-- 'centro_de_localizacao' e 'fase' encontradas na tabela 'hierarquia'.
-- A inserção só ocorre para combinações que ainda não possuem nenhuma equipe cadastrada,
-- evitando duplicatas e garantindo que o script possa ser executado várias vezes sem problemas.

INSERT INTO equipes (centro_de_localizacao, fase, especialidade, hh, capacidade)
SELECT
    h.centro_de_localizacao,
    h.fase,
    porto_teams.especialidade,
    porto_teams.hh,
    porto_teams.capacidade
FROM
    -- 1. Obter todas as combinações únicas de centro de localização e fase da tabela de hierarquia.
    (
        SELECT DISTINCT centro_de_localizacao, fase
        FROM hierarquia
    ) AS h
CROSS JOIN
    -- 2. Obter todas as equipes de referência do '1089-Porto'.
    (
        SELECT especialidade, hh, capacidade
        FROM equipes
        WHERE centro_de_localizacao = '1089-Porto'
    ) AS porto_teams
LEFT JOIN
    -- 3. Verificar se já existe alguma equipe para a combinação de centro e fase.
    equipes existing_teams ON h.centro_de_localizacao = existing_teams.centro_de_localizacao AND h.fase = existing_teams.fase
WHERE
    -- 4. Inserir apenas se a combinação (centro de localização + fase) não tiver nenhuma equipe.
    existing_teams.id IS NULL;

-- Mensagem de sucesso para o usuário.
SELECT 'Script de população de equipes executado com sucesso.' as status;
