import { supabase } from './supabase';

export type Filtros = {
  nome_grupo?: string;
  tipo_grupo?: string;
  diretoria_executiva?: string;
  diretoria?: string;
  unidade?: string;
  centro_de_localizacao?: string;
  fase?: string;
  categoria?: string;
};

// Fetches available options for a specific hierarchy level, filtered by previous selections.
export const getHierarquiaOpcoes = async (
  campo: keyof Omit<Filtros, 'nome_grupo' | 'tipo_grupo'>,
  filtros: Omit<Filtros, 'nome_grupo' | 'tipo_grupo' | 'fase' | 'categoria'> = {}
): Promise<string[]> => {
  try {
    let query = supabase.from('hierarquia').select(campo, { count: 'exact', head: false });

    // Apply filters based on previous selections
    for (const [key, value] of Object.entries(filtros)) {
      if (value) {
        query = query.eq(key, value);
      }
    }

    const { data, error } = await query.throwOnError();

    if (error) {
      console.error(`Error fetching options for ${campo}:`, error);
      return [];
    }

    // Get unique, non-null values and sort them
    const result = [...new Set(data?.map(item => item[campo]).filter(Boolean) as string[])].sort();
    return result;
    
  } catch (error) {
    console.error(`Exception when fetching options for ${campo}:`, error);
    // On error, return an empty array to prevent app crash and log the detailed error.
    // This often happens if a column name is incorrect.
    // We will log the error to the server console for debugging.
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

        return ativos_data.map(ativo => ativo.local_de_instalacao).sort();
    } catch(error) {
        console.error('Exception when fetching ativos:', error);
        return [];
    }
};
