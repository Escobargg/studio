// Mock data simulating Supabase tables

const hierarquia_data = [
  { id: 1, descricao_do_centro: 'Carajás', fase: 'Operação', Diretoria_Executiva_Corredor: 'Ferrosos Norte', Diretoria: 'Operações', Unidade: 'Mina N4', Categoria: 'Extração' },
  { id: 2, descricao_do_centro: 'Carajás', fase: 'Expansão', Diretoria_Executiva_Corredor: 'Ferrosos Norte', Diretoria: 'Projetos', Unidade: 'Planta de Beneficiamento', Categoria: 'Beneficiamento' },
  { id: 3, descricao_do_centro: 'Itabira', fase: 'Operação', Diretoria_Executiva_Corredor: 'Ferrosos Sudeste', Diretoria: 'Operações', Unidade: 'Mina do Meio', Categoria: 'Extração' },
  { id: 4, descricao_do_centro: 'Itabira', fase: 'Manutenção', Diretoria_Executiva_Corredor: 'Ferrosos Sudeste', Diretoria: 'Manutenção', Unidade: 'Oficina Central', Categoria: 'Manutenção' },
  { id: 5, descricao_do_centro: 'Mariana', fase: 'Operação', Diretoria_Executiva_Corredor: 'Ferrosos Sudeste', Diretoria: 'Operações', Unidade: 'Alegria', Categoria: 'Extração' },
  { id: 6, descricao_do_centro: 'Sossego', fase: 'Operação', Diretoria_Executiva_Corredor: 'Cobre', Diretoria: 'Operações Cobre', Unidade: 'Mina Sossego', Categoria: 'Cobre' },
  { id: 7, descricao_do_centro: 'Sossego', fase: 'Manutenção', Diretoria_Executiva_Corredor: 'Cobre', Diretoria: 'Manutenção Cobre', Unidade: 'Oficina Sossego', Categoria: 'Manutenção' },
  { id: 8, descricao_do_centro: 'Salobo', fase: 'Operação', Diretoria_Executiva_Corredor: 'Cobre', Diretoria: 'Operações Cobre', Unidade: 'Mina Salobo', Categoria: 'Cobre' },
  { id: 9, descricao_do_centro: 'Carajás', fase: 'Operação', Diretoria_Executiva_Corredor: 'Ferrosos Norte', Diretoria: 'Operações', Unidade: 'Mina N5', Categoria: 'Extração' },
  { id: 10, descricao_do_centro: 'Itabira', fase: 'Operação', Diretoria_Executiva_Corredor: 'Ferrosos Sudeste', Diretoria: 'Operações', Unidade: 'Conceição', Categoria: 'Extração' },
];

const ativos_data = [
  // Carajás
  { id: 101, local_de_instalacao: 'CA-TR-001', centro_de_localizacao: 'Carajás' },
  { id: 102, local_de_instalacao: 'CA-PC-005', centro_de_localizacao: 'Carajás' },
  { id: 103, local_de_instalacao: 'CA-CV-110', centro_de_localizacao: 'Carajás' },
  { id: 104, local_de_instalacao: 'CA-BR-021', centro_de_localizacao: 'Carajás' },
  { id: 105, local_de_instalacao: 'CA-TR-002', centro_de_localizacao: 'Carajás' },

  // Itabira
  { id: 201, local_de_instalacao: 'IT-TR-050', centro_de_localizacao: 'Itabira' },
  { id: 202, local_de_instalacao: 'IT-TR-051', centro_de_localizacao: 'Itabira' },
  { id: 203, local_de_instalacao: 'IT-MO-300', centro_de_localizacao: 'Itabira' },
  { id: 204, local_de_instalacao: 'IT-PE-201', centro_de_localizacao: 'Itabira' },

  // Mariana
  { id: 301, local_de_instalacao: 'MA-TR-101', centro_de_localizacao: 'Mariana' },
  { id: 302, local_de_instalacao: 'MA-PC-102', centro_de_localizacao: 'Mariana' },

  // Sossego
  { id: 401, local_de_instalacao: 'SO-BL-001', centro_de_localizacao: 'Sossego' },
  { id: 402, local_de_instalacao: 'SO-MO-002', centro_de_localizacao: 'Sossego' },
  { id: 403, local_de_instalacao: 'SO-TR-003', centro_de_localizacao: 'Sossego' },

  // Salobo
  { id: 501, local_de_instalacao: 'SL-CV-001', centro_de_localizacao: 'Salobo' },
  { id: 502, local_de_instalacao: 'SL-BR-002', centro_de_localizacao: 'Salobo' },
];

// Helper to get unique values from an array of objects
const getUniqueValues = (data: any[], key: string): string[] => {
  return [...new Set(data.map(item => item[key]))].sort();
};

export type HierarquiaData = {
    centros: string[];
    fases: string[];
    diretoriasExecutivas: string[];
    diretorias: string[];
    unidades: string[];
    categorias: string[];
}

// Simulates fetching and processing hierarchy data
export const getHierarquiaData = async (): Promise<HierarquiaData> => {
  // In a real app, this would be a Supabase query
  // e.g., const { data, error } = await supabase.from('hierarquia').select('*');
  
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  return {
    centros: getUniqueValues(hierarquia_data, 'descricao_do_centro'),
    fases: getUniqueValues(hierarquia_data, 'fase'),
    diretoriasExecutivas: getUniqueValues(hierarquia_data, 'Diretoria_Executiva_Corredor'),
    diretorias: getUniqueValues(hierarquia_data, 'Diretoria'),
    unidades: getUniqueValues(hierarquia_data, 'Unidade'),
    categorias: getUniqueValues(hierarquia_data, 'Categoria'),
  };
};

// Simulates fetching assets based on a location center
export const getAtivosByCentro = async (centro: string): Promise<string[]> => {
    if (!centro) {
        return [];
    }
  
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const filteredAssets = ativos_data.filter(ativo => ativo.centro_de_localizacao === centro);
    return filteredAssets.map(ativo => ativo.local_de_instalacao).sort();
};
