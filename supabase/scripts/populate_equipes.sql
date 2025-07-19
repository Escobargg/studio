-- This script populates the 'equipes' table for all location/phase combinations
-- based on the teams defined for '1089-Porto'. It avoids creating duplicates.

INSERT INTO equipes (centro_de_localizacao, fase, especialidade, hh, capacidade)
SELECT
    h.centro_de_localizacao,
    h.fase,
    template_teams.especialidade,
    template_teams.hh,
    template_teams.capacidade
FROM
    -- 1. Get all unique location/phase combinations from the hierarchy
    (SELECT DISTINCT centro_de_localizacao, fase FROM hierarquia) AS h
CROSS JOIN
    -- 2. Get the template teams from '1089-Porto'
    (SELECT especialidade, hh, capacidade FROM equipes WHERE centro_de_localizacao = '1089-Porto') AS template_teams
LEFT JOIN
    -- 3. Check for existing teams to avoid duplicates
    equipes existing_teams
    ON h.centro_de_localizacao = existing_teams.centro_de_localizacao
    AND h.fase = existing_teams.fase
    AND template_teams.especialidade = existing_teams.especialidade
WHERE
    -- 4. Only insert if the team doesn't already exist for that location/phase
    existing_teams.id IS NULL;
