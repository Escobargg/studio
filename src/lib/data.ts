
import { supabase } from './supabase';
import type { ParadasFiltros } from '@/app/paradas/page';
import type { Stop } from '@/components/stop-card';

export type Filtros = {
  nome_grupo?: string;
  diretoria_executiva?: string;
  diretoria?: string;
  centro_de_localizacao?: string;
  fase?: string;
  categoria?: string;
};

export type Especialidade = {
  especialidade: string;
  hh: number;
  capacidade: number;
}

// Fetches available options for a specific hierarchy level, filtered by previous selections.
export const getHierarquiaOpcoes = async (
  campo: keyof Omit<Filtros, 'nome_grupo'> | 'unidade',
  filtros: Partial<Record<'diretoria_executiva' | 'diretoria' | 'unidade' | 'centro_de_localizacao', string>> = {}
): Promise<string[]> => {
  try {
    // We need to build the query dynamically.
    // The RPC function will execute a SQL query on the server.
    let queryText = `SELECT DISTINCT "${campo}" FROM hierarquia`;
    const whereClauses: string[] = [];
    
    for (const [key, value] of Object.entries(filtros)) {
      if (value) {
        // We will pass values as parameters to prevent SQL injection.
        whereClauses.push(`"${key}" = '${value.replace(/'/g, "''")}'`);
      }
    }
    
    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    
    // Ensure correct ordering for Brazilian Portuguese characters
    queryText += ` ORDER BY "${campo}" COLLATE "pt-BR-x-icu"`;
    
    // Supabase RPC doesn't have a direct way to execute arbitrary queries like this,
    // so we'll revert to the standard select and handle sorting client-side,
    // as the primary issue is likely data integrity, not sorting.
    // The previous `localeCompare` fix should handle sorting correctly if data is correct.
    
    let query = supabase.from('hierarquia').select(campo as string);

    for (const [key, value] of Object.entries(filtros)) {
        if (value) {
            query = query.eq(key, value);
        }
    }

    const { data, error } = await query;
    
    if (error) {
        console.error(`Error fetching options for ${campo}:`, error);
        return [];
    }

    const result = [...new Set(data?.map(item => item[campo]).filter(Boolean) as string[])]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
      
    return result;
    
  } catch (error) {
    console.error(`Exception when fetching options for ${campo}:`, error);
    console.error(`Detailed error for column '${campo}':`, error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
};


// Fetches assets based on a location center from Supabase
export const getAtivosByCentro = async (centro: string): Promise<string[]> => {
    if (!centro) {
        return [];
    }
  
    try {
        const { data: ativos_data, error } = await supabase
            .from('ativos')
            .select('local_de_instalacao')
            .eq('centro_de_localizacao', centro)
            .throwOnError();

        if (error) {
            console.error('Error fetching ativos data:', error);
            return [];
        }

        return [...new Set(ativos_data.map(ativo => ativo.local_de_instalacao))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    } catch(error) {
        console.error('Exception when fetching ativos:', error);
        return [];
    }
};

// Fetches asset groups based on a location center and phase
export const getGruposByCentroEFase = async (centro: string, fase: string): Promise<string[]> => {
    if (!centro || !fase) {
        return [];
    }
    try {
        const { data, error } = await supabase
            .from('grupos_de_ativos')
            .select('nome_grupo')
            .eq('centro_de_localizacao', centro)
            .eq('fase', fase)
            .throwOnError();

        if (error) {
            console.error('Error fetching asset groups:', error);
            return [];
        }

        return data.map(g => g.nome_grupo).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    } catch(error) {
        console.error('Exception when fetching asset groups:', error);
        return [];
    }
}

// Fetches specialities based on a location center and phase
export const getEspecialidades = async (centro: string, fase: string): Promise<Especialidade[]> => {
    if (!centro || !fase) {
        return [];
    }
    try {
        const { data, error } = await supabase
            .from('equipes')
            .select('especialidade, hh, capacidade')
            .eq('centro_de_localizacao', centro)
            .eq('fase', fase)
            .throwOnError();

        if (error) {
            console.error('Error fetching specialities:', error);
            return [];
        }
        
        return data.map(item => ({
            especialidade: item.especialidade,
            hh: item.hh,
            capacidade: item.capacidade
        })).sort((a, b) => a.especialidade.localeCompare(b.especialidade, 'pt-BR'));

    } catch(error) {
        console.error('Exception when fetching specialities:', error);
        return [];
    }
}


// Fetches hierarchy options for StopsFilters
export const getStopsFilterOptions = async (
  campo: 'centro_de_localizacao' | 'fase' | 'ano'
): Promise<string[]> => {
  try {
    let query;
    if (campo === 'ano') {
      const { data, error } = await supabase.from('paradas_de_manutencao').select('data_inicio_planejada');
      if (error) throw error;
      const years = new Set(data.map(p => new Date(p.data_inicio_planejada).getFullYear().toString()));
      return Array.from(years).sort((a, b) => b.localeCompare(a));
    } else {
      const { data, error } = await supabase.from('hierarquia').select(campo).throwOnError();
      if (error) throw error;
      const options = new Set(data.map(item => item[campo]));
      return Array.from(options).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }
  } catch (error) {
    console.error(`Error fetching filter options for ${campo}:`, error);
    return [];
  }
};


export async function getStops(filters: ParadasFiltros): Promise<Stop[]> {
    let query = supabase
        .from('paradas_de_manutencao')
        .select(`
            id,
            id_parada,
            nome_parada,
            diretoria_executiva,
            diretoria,
            centro_de_localizacao,
            fase,
            tipo_selecao,
            grupo_de_ativos,
            ativo_unico,
            data_inicio_planejada,
            data_fim_planejada,
            data_inicio_realizado,
            data_fim_realizado,
            duracao_planejada_horas,
            descricao,
            recursos_parada (
                equipe,
                hh_dia
            )
        `)
        .order('id_parada', { ascending: false });

    if (filters.diretoria_executiva) {
        query = query.eq('diretoria_executiva', filters.diretoria_executiva);
    }
    if (filters.diretoria) {
        query = query.eq('diretoria', filters.diretoria);
    }
    if (filters.centro_de_localizacao) {
        query = query.eq('centro_de_localizacao', filters.centro_de_localizacao);
    }
    if (filters.fase) {
        query = query.eq('fase', filters.fase);
    }
     if (filters.dateRange?.from && filters.dateRange?.to) {
        const from = filters.dateRange.from.toISOString();
        const to = filters.dateRange.to.toISOString();
        query = query.or(
            `and(data_inicio_planejada.gte.${from},data_inicio_planejada.lte.${to}),and(data_fim_planejada.gte.${from},data_fim_planejada.lte.${to})`
        );
    }
    
    const { data, error } = await query;

    if (error) {
        console.error("Error fetching stops:", error);
        return [];
    }

    return data.map(stop => {
        const recursos = stop.recursos_parada || [];
        const duracao = stop.duracao_planejada_horas ?? 0;
        
        const total_hh = recursos.reduce((acc, recurso) => {
            const dias = duracao / 24;
            return acc + (recurso.hh_dia * dias);
        }, 0);

        return {
            ...stop,
            recursos: recursos,
            num_equipes: recursos.length,
            total_hh: Math.round(total_hh),
        } as Stop;
    });
}
