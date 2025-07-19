
import { supabase } from './supabase';
import type { ParadasFiltros } from '@/app/paradas/page';
import type { Stop } from '@/components/stop-card';
import type { ScheduleData } from '@/components/schedule-view';
import { startOfYear, endOfYear, add, getMonth, getISOWeek, startOfMonth, endOfMonth, startOfWeek, endOfWeek, setISOWeek, startOfISOWeek, endOfISOWeek } from 'date-fns';
import type { CronogramaFiltros } from '@/components/schedule-filters';

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


export async function getScheduleData(filters: CronogramaFiltros): Promise<ScheduleData[]> {
    const year = parseInt(filters.ano || new Date().getFullYear().toString());
    
    // Determine the date range for the query based on filters
    let queryStart, queryEnd;

    if (filters.mes) {
        const monthIndex = parseInt(filters.mes, 10) - 1;
        queryStart = startOfMonth(new Date(year, monthIndex));
        queryEnd = endOfMonth(new Date(year, monthIndex));
    } else if (filters.semana) {
        const weekIndex = parseInt(filters.semana, 10);
        const dateForWeek = setISOWeek(new Date(year, 0, 4), weekIndex); 
        queryStart = startOfISOWeek(dateForWeek);
        queryEnd = endOfISOWeek(queryStart);
    } else {
        queryStart = startOfYear(new Date(year, 0, 1));
        queryEnd = endOfYear(new Date(year, 11, 31));
    }
    
    const scheduleMap = new Map<string, { groupName: string; location: string; items: any[] }>();

    // 1. Fetch all groups that match the filters
    let groupsQuery = supabase
        .from('grupos_de_ativos')
        .select('id, nome_grupo, centro_de_localizacao, fase');
    
    if (filters.diretoria_executiva) groupsQuery = groupsQuery.eq('diretoria_executiva', filters.diretoria_executiva);
    if (filters.diretoria) groupsQuery = groupsQuery.eq('diretoria', filters.diretoria);
    if (filters.centro_de_localizacao) groupsQuery = groupsQuery.eq('centro_de_localizacao', filters.centro_de_localizacao);
    if (filters.fase) groupsQuery = groupsQuery.eq('fase', filters.fase);
    
    const { data: filteredGroups, error: groupsError } = await groupsQuery;

    if (groupsError) {
        console.error("Error fetching filtered groups for schedule:", groupsError);
        return [];
    }

    if (!filteredGroups || filteredGroups.length === 0) {
        return [];
    }
    
    // Pre-populate the map with filtered groups to show them even if they have no items
    filteredGroups.forEach(group => {
        scheduleMap.set(group.id, {
            groupName: group.nome_grupo,
            location: `${group.centro_de_localizacao} - ${group.fase}`,
            items: []
        });
    });

    const filteredGroupIds = new Set(filteredGroups.map(g => g.id));
    const groupNameToIdMap = new Map(filteredGroups.map(g => [g.nome_grupo, g.id]));

    // 2. Fetch all strategies for the year
    let strategiesQuery = supabase
        .from('estrategias')
        .select('id, nome, prioridade, frequencia_valor, frequencia_unidade, duracao_valor, duracao_unidade, data_inicio, data_fim, grupo_id')
        .eq('ativa', true)
        .lte('data_inicio', queryEnd.toISOString())
        .or(`data_fim.is.null,data_fim.gte.${queryStart.toISOString()}`);
    
    const { data: strategiesData, error: strategiesError } = await strategiesQuery;
    
    if (strategiesError) {
        console.error("Error fetching strategies for schedule:", strategiesError);
    } else {
        strategiesData.forEach(strategy => {
            const groupKey = strategy.grupo_id;
            // Only process if the strategy belongs to a group that passed the location filters
            if (groupKey && filteredGroupIds.has(groupKey)) {
                let currentDate = new Date(strategy.data_inicio);
                const strategyEndDate = strategy.data_fim ? new Date(strategy.data_fim) : queryEnd;
                const intervalDays = getFrequencyInDays(strategy.frequencia_valor, strategy.frequencia_unidade);
                const duration = { [strategy.duracao_unidade.toLowerCase()]: strategy.duracao_valor };

                while (currentDate <= strategyEndDate && currentDate <= queryEnd) {
                    const eventEndDate = add(currentDate, duration);
                    // Check if event overlaps with the query range
                    if (currentDate <= queryEnd && eventEndDate >= queryStart) {
                        scheduleMap.get(groupKey)?.items.push({
                            id: `${strategy.id}-${currentDate.toISOString()}`,
                            name: strategy.nome,
                            startDate: currentDate,
                            endDate: eventEndDate,
                            type: 'strategy',
                            priority: strategy.prioridade,
                        });
                    }
                     // Move to the next date only if interval is positive
                    if (intervalDays > 0) {
                        currentDate = add(currentDate, { days: intervalDays });
                    } else {
                        // Break to avoid infinite loop
                        break;
                    }
                }
            }
        });
    }

    // 3. Fetch all stops for the year
    let stopsQuery = supabase
        .from('paradas_de_manutencao')
        .select('id, nome_parada, data_inicio_planejada, data_fim_planejada, tipo_selecao, grupo_de_ativos, ativo_unico, centro_de_localizacao, fase, status')
        .or(`and(data_inicio_planejada.gte.${queryStart.toISOString()},data_inicio_planejada.lte.${queryEnd.toISOString()}),and(data_fim_planejada.gte.${queryStart.toISOString()},data_fim_planejada.lte.${queryEnd.toISOString()}),and(data_inicio_planejada.lte.${queryStart.toISOString()},data_fim_planejada.gte.${queryEnd.toISOString()})`);
    
    if (filters.diretoria_executiva) stopsQuery = stopsQuery.eq('diretoria_executiva', filters.diretoria_executiva);
    if (filters.diretoria) stopsQuery = stopsQuery.eq('diretoria', filters.diretoria);
    if (filters.centro_de_localizacao) stopsQuery = stopsQuery.eq('centro_de_localizacao', filters.centro_de_localizacao);
    if (filters.fase) stopsQuery = stopsQuery.eq('fase', filters.fase);

    const { data: stopsData, error: stopsError } = await stopsQuery;

    if (stopsError) {
        console.error("Error fetching stops for schedule:", stopsError);
    } else {
        stopsData.forEach(stop => {
            let groupKey: string | null = null;
            let groupName: string | null = null;
            let location: string = `${stop.centro_de_localizacao} - ${stop.fase}`;
            
            if (stop.tipo_selecao === 'grupo' && stop.grupo_de_ativos) {
                groupKey = groupNameToIdMap.get(stop.grupo_de_ativos) || null;
            } else if (stop.tipo_selecao === 'ativo' && stop.ativo_unico) {
                groupName = stop.ativo_unico;
                groupKey = `ativo-${groupName}-${location}`;
                 if (!scheduleMap.has(groupKey)) {
                     scheduleMap.set(groupKey, { groupName: groupName, location, items: [] });
                 }
            }

            if(groupKey && scheduleMap.has(groupKey)) {
                scheduleMap.get(groupKey)?.items.push({
                    id: stop.id,
                    name: stop.nome_parada,
                    startDate: new Date(stop.data_inicio_planejada),
                    endDate: new Date(stop.data_fim_planejada),
                    type: 'stop',
                    status: stop.status || 'Planejada',
                });
            }
        });
    }

    let finalData = Array.from(scheduleMap.values());
    
    return finalData.sort((a,b) => a.groupName.localeCompare(b.groupName));
}
