import { supabase } from './supabase';

// Helper to get unique values from an array of objects
const getUniqueValues = (data: any[], key: string): string[] => {
  if (!data) return [];
  // Filter out null or undefined values before creating the Set
  return [...new Set(data.map(item => item[key]).filter(Boolean))].sort();
};

export type HierarquiaData = {
    centros: string[];
    fases: string[];
    diretoriasExecutivas: string[];
    diretorias: string[];
    unidades: string[];
    categorias: string[];
}

// Fetches and processes hierarchy data from Supabase
export const getHierarquiaData = async (): Promise<HierarquiaData> => {
  const { data: hierarquia_data, error } = await supabase
    .from('hierarquia')
    .select('descricao_do_centro, fase, diretoria_executiva_corredor, diretoria, unidade, categoria');

  if (error) {
    console.error('Error fetching hierarquia data:', error);
    // Return empty arrays on error to prevent app crash
    return {
      centros: [],
      fases: [],
      diretoriasExecutivas: [],
      diretorias: [],
      unidades: [],
      categorias: [],
    };
  }

  return {
    centros: getUniqueValues(hierarquia_data, 'descricao_do_centro'),
    fases: getUniqueValues(hierarquia_data, 'fase'),
    diretoriasExecutivas: getUniqueValues(hierarquia_data, 'diretoria_executiva_corredor'),
    diretorias: getUniqueValues(hierarquia_data, 'diretoria'),
    unidades: getUniqueValues(hierarquia_data, 'unidade'),
    categorias: getUniqueValues(hierarquia_data, 'categoria'),
  };
};

// Fetches assets based on a location center from Supabase
export const getAtivosByCentro = async (centro: string): Promise<string[]> => {
    if (!centro) {
        return [];
    }
  
    const { data: ativos_data, error } = await supabase
        .from('ativos')
        .select('local_de_instalacao')
        .eq('centro_de_localizacao', centro);

    if (error) {
        console.error('Error fetching ativos data:', error);
        return [];
    }

    return ativos_data.map(ativo => ativo.local_de_instalacao).sort();
};
