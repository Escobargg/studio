"use client";

import { useState, useEffect, useTransition } from "react";
import { AssetGroupCard } from "@/components/asset-group-card";
import { MainLayout } from "@/components/main-layout";
import { supabase } from "@/lib/supabase";
import { Building, Loader2 } from "lucide-react";
import type { Filtros } from "@/lib/data";
import { GroupFilters } from "@/components/group-filters";
import type { Grupo } from "@/components/asset-group-card";

async function getGruposDeAtivos(filtros: Filtros) {
  let query = supabase
    .from("grupos_de_ativos")
    .select("*")
    .order("created_at", { ascending: false });

  // Aplica filtros exatos (exceto nome_grupo)
  Object.entries(filtros).forEach(([key, value]) => {
    if (value && key !== 'nome_grupo') {
      query = query.eq(key, value);
    }
  });

  // Aplica filtro de texto para nome_grupo
  if (filtros.nome_grupo) {
    query = query.ilike('nome_grupo', `%${filtros.nome_grupo}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar grupos de ativos:", error);
    return [];
  }
  return data;
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getGruposDeAtivos(filtros);
      setGrupos(data as Grupo[]);
    });
  }, [filtros]);
  
  const handleGroupUpdate = (updatedGroup: Grupo) => {
    setGrupos(currentGrupos =>
      currentGrupos.map(g => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="p-4 md:p-6 bg-card border-b">
           <GroupFilters onFilterChange={setFiltros} />
        </div>
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {isPending ? (
               <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <h2 className="mt-6 text-2xl font-semibold">Buscando Grupos...</h2>
                    <p className="mt-2 text-muted-foreground">Aguarde um momento.</p>
                </div>
            ) : grupos.length > 0 ? (
              <div className="flex flex-col gap-4">
                {grupos.map((grupo) => (
                  <AssetGroupCard 
                    key={grupo.id} 
                    grupo={grupo} 
                    onGroupUpdate={handleGroupUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Building className="w-16 h-16 text-muted-foreground" />
                <h2 className="mt-6 text-2xl font-semibold">
                  Nenhum Grupo de Ativos Encontrado
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Ajuste os filtros ou crie um novo grupo para vê-lo listado aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
