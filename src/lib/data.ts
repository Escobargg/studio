
import { supabase } from './supabase';
import type { ParadasFiltros } from '@/app/paradas/page';
import type { Stop } from '@/components/stop-card';
import type { ScheduleData } from '@/components/schedule-view';
import { startOfYear, endOfYear, add, interval } from 'date-fns';

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
  campo: keyof Omit<Filtros, 'nome_grupo' | 'categoria'>,
  filtros: Partial<Record<'diretoria_executiva' | 'diretoria' | 'centro_de_localizacao', string>> = {}
): Promise<string[]> => {
  try {
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

const getFrequencyInDays = (value: number, unit: string) => {
    switch (unit) {
        case 'DIAS': return value;
        case 'SEMANAS': return value * 7;
        case 'MESES': return value * 30; // Approximation
        case 'ANOS': return value * 365;
        default: return value;
    }
};


export async function getScheduleData(year: number): Promise<ScheduleData[]> {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    
    // Create a map of group names to their IDs for easier lookup
    const { data: allGroups, error: groupsError } = await supabase.from('grupos_de_ativos').select('id, nome_grupo');
    if (groupsError) {
        console.error("Error fetching groups for mapping:", groupsError);
        return [];
    }
    const groupNameToIdMap = new Map(allGroups.map(g => [g.nome_grupo, g.id]));

    // Fetch strategies and expand them into occurrences
    const { data: strategiesData, error: strategiesError } = await supabase
        .from('estrategias')
        .select(`
            id,
            nome,
            prioridade,
            frequencia_valor,
            frequencia_unidade,
            duracao_valor,
            duracao_unidade,
            data_inicio,
            data_fim,
            grupos_de_ativos (
                id,
                nome_grupo,
                centro_de_localizacao,
                fase
            )
        `)
        .eq('ativa', true)
        .lte('data_inicio', yearEnd.toISOString())
        .or(`data_fim.is.null,data_fim.gte.${yearStart.toISOString()}`);
    
    if (strategiesError) {
        console.error("Error fetching strategies for schedule:", strategiesError);
        return [];
    }

    const scheduleMap = new Map<string, { groupName: string; location: string; items: any[] }>();

    strategiesData.forEach(strategy => {
        if (!strategy.grupos_de_ativos) return;

        const groupKey = strategy.grupos_de_ativos.id;
        if (!scheduleMap.has(groupKey)) {
            scheduleMap.set(groupKey, {
                groupName: strategy.grupos_de_ativos.nome_grupo,
                location: `${strategy.grupos_de_ativos.centro_de_localizacao} - ${strategy.grupos_de_ativos.fase}`,
                items: []
            });
        }
        
        // Calculate occurrences for the given year
        let currentDate = new Date(strategy.data_inicio);
        const strategyEndDate = strategy.data_fim ? new Date(strategy.data_fim) : yearEnd;
        const intervalDays = getFrequencyInDays(strategy.frequencia_valor, strategy.frequencia_unidade);
        const duration = { [strategy.duracao_unidade.toLowerCase()]: strategy.duracao_valor };


        while (currentDate <= strategyEndDate && currentDate <= yearEnd) {
            if (currentDate >= yearStart) {
                scheduleMap.get(groupKey)?.items.push({
                    id: `${strategy.id}-${currentDate.toISOString()}`,
                    name: strategy.nome,
                    startDate: currentDate,
                    endDate: add(currentDate, duration),
                    type: 'strategy',
                    priority: strategy.prioridade,
                });
            }
             currentDate = add(currentDate, { days: intervalDays });
        }
    });

    // Fetch stops for the year
     const { data: stopsData, error: stopsError } = await supabase
        .from('paradas_de_manutencao')
        .select(`
            id,
            nome_parada,
            data_inicio_planejada,
            data_fim_planejada,
            tipo_selecao,
            grupo_de_ativos,
            ativo_unico,
            centro_de_localizacao,
            fase
        `)
        .gte('data_inicio_planejada', yearStart.toISOString())
        .lte('data_inicio_planejada', yearEnd.toISOString());

    if (stopsError) {
        console.error("Error fetching stops for schedule:", stopsError);
        // Continue with just strategies if stops fail
    } else {
        stopsData.forEach(stop => {
            let groupKey: string | null = null;
            let groupName: string | null = null;
            
            if (stop.tipo_selecao === 'grupo' && stop.grupo_de_ativos) {
                groupKey = groupNameToIdMap.get(stop.grupo_de_ativos) || null;
                groupName = stop.grupo_de_ativos;
            } else if (stop.tipo_selecao === 'ativo' && stop.ativo_unico) {
                groupName = stop.ativo_unico;
                groupKey = `${groupName}-${stop.centro_de_localizacao}-${stop.fase}`;
            }

            if (!groupKey) return; 
            
            const location = `${stop.centro_de_localizacao} - ${stop.fase}`;

            if (!scheduleMap.has(groupKey)) {
                 scheduleMap.set(groupKey, { groupName: groupName || "Grupo Desconhecido", location, items: [] });
            }

            scheduleMap.get(groupKey)?.items.push({
                id: stop.id,
                name: stop.nome_parada,
                startDate: new Date(stop.data_inicio_planejada),
                endDate: new Date(stop.data_fim_planejada),
                type: 'stop',
                status: 'Planejada',
            });
        });
    }


    return Array.from(scheduleMap.values());
}
