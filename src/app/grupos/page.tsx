
"use client";

import { useState, useEffect, useCallback } from "react";
import { AssetGroupCard } from "@/components/asset-group-card";
import { MainLayout } from "@/components/main-layout";
import { supabase } from "@/lib/supabase";
import { Building, Loader2, PlusCircle, LayoutGrid } from "lucide-react";
import type { Filtros } from "@/lib/data";
import { GroupFilters } from "@/components/group-filters";
import type { Grupo } from "@/components/asset-group-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getGruposDeAtivos(filtros: Filtros) {
  let query = supabase
    .from("grupos_de_ativos")
    .select("*, estrategias_count:estrategias(count)")
    .order("created_at", { ascending: false });

  // Add a filter to count only active strategies
  query = query.eq('estrategias.ativa', true);

  Object.entries(filtros).forEach(([key, value]) => {
    if (value && key !== 'nome_grupo') {
      query = query.eq(key, value);
    }
  });

  if (filtros.nome_grupo) {
    query = query.ilike('nome_grupo', `%${filtros.nome_grupo}%`);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === 'PGRST204') { 
        let fallbackQuery = supabase
            .from("grupos_de_ativos")
            .select("*, estrategias_count:estrategias(count)")
            .order("created_at", { ascending: false });

        Object.entries(filtros).forEach(([key, value]) => {
            if (value && key !== 'nome_grupo') {
                fallbackQuery = fallbackQuery.eq(key, value);
            }
        });
        if (filtros.nome_grupo) {
            fallbackQuery = fallbackQuery.ilike('nome_grupo', `%${filtros.nome_grupo}%`);
        }
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if(fallbackError) {
             console.error("Erro ao buscar grupos de ativos (fallback):", fallbackError);
             return [];
        }
        // No fallback, we must assume a count of 0 for non-active strategies.
        return fallbackData.map(grupo => ({
            ...grupo,
            estrategias_count: 0,
        }));
    }
    console.error("Erro ao buscar grupos de ativos:", error);
    return [];
  }
  
  return data.map(grupo => ({
    ...grupo,
    estrategias_count: grupo.estrategias_count[0]?.count ?? 0,
  }));
}


export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGrupos = async () => {
      setIsLoading(true);
      const data = await getGruposDeAtivos(filtros);
      setGrupos(data as Grupo[]);
      setIsLoading(false);
    };

    fetchGrupos();
  }, [filtros]);
  
  const handleGroupUpdate = (updatedGroup: Grupo) => {
    setGrupos(currentGrupos =>
      currentGrupos.map(g => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  const handleGroupDelete = (deletedGroupId: string) => {
    setGrupos(currentGrupos =>
      currentGrupos.filter(g => g.id !== deletedGroupId)
    );
  };
  
  const handleFilterChange = useCallback((newFilters: Filtros) => {
    setFiltros(newFilters);
  }, []);

  return (
    <MainLayout>
      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-muted/20 space-y-4">
        <Card>
           <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                         <LayoutGrid className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Grupos de Ativos</CardTitle>
                        <CardDescription>
                            Visualize e gerencie os grupos de ativos cadastrados.
                        </CardDescription>
                    </div>
                </div>
                <Button asChild>
                  <Link href="/grupos/novo">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Grupo
                  </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <GroupFilters filters={filtros} onFilterChange={handleFilterChange} />
            </CardContent>
        </Card>

        <div className="space-y-4">
            {isLoading ? (
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
                        onGroupDelete={handleGroupDelete}
                    />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-20">
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
    </MainLayout>
  );
}
