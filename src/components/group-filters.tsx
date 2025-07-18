
"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHierarquiaOpcoes } from "@/lib/data";
import type { Filtros } from "@/lib/data";
import { Loader2, X } from "lucide-react";

interface GroupFiltersProps {
  onFilterChange: (filters: Filtros) => void;
}

type OptionsState = {
  centrosLocalizacao: string[];
  fases: string[];
  categorias: string[];
};

export function GroupFilters({ onFilterChange }: GroupFiltersProps) {
  const [filters, setFilters] = useState<Filtros>({});
  const [options, setOptions] = useState<OptionsState>({
    centrosLocalizacao: [],
    fases: [],
    categorias: [],
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  // Fetch initial options
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(prev => ({ ...prev, centrosLocalizacao: true }));
      // Fetch all possible "centro_de_localizacao" initially without filters
      const centros = await getHierarquiaOpcoes("centro_de_localizacao");
      setOptions(prev => ({ ...prev, centrosLocalizacao: centros }));
      setLoading(prev => ({ ...prev, centrosLocalizacao: false }));
    };
    fetchInitial();
  }, []);
  
  // Propagate filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500); // Debounce to avoid excessive re-renders
    return () => clearTimeout(handler);
  }, [filters]);


  const handleSelectChange = (field: keyof Filtros, value: string) => {
    const newFilters = { ...filters, [field]: value };
    let fieldsToReset: (keyof Filtros)[] = [];

    // Reset subsequent fields
    if (field === 'centro_de_localizacao') {
        fieldsToReset = ['fase', 'categoria'];
    }
    
    fieldsToReset.forEach(f => delete newFilters[f]);
    setFilters(newFilters);
    
    // Clear options for reset fields
    const newOptions = {...options};
    if (fieldsToReset.includes('fase')) newOptions.fases = [];
    if (fieldsToReset.includes('categoria')) newOptions.categorias = [];
    setOptions(newOptions);


    // Fetch new options for the next field
    startTransition(() => {
        const fetchNextOptions = async () => {
            if (field === 'centro_de_localizacao' && value) {
                 setLoading(prev => ({ ...prev, fases: true, categorias: true }));
                 const [fasesData, categoriasData] = await Promise.all([
                    getHierarquiaOpcoes('fase', {centro_de_localizacao: value} as any),
                    getHierarquiaOpcoes('categoria', {centro_de_localizacao: value} as any)
                 ]);
                 setOptions(prev => ({...prev, fases: fasesData, categorias: categoriasData}));
                 setLoading(prev => ({ ...prev, fases: false, categorias: false }));
            }
        };
        fetchNextOptions();
    });
  };

  const clearFilters = () => {
    setFilters({});
    setOptions(prev => ({
        ...prev,
        fases: [],
        categorias: [],
    }));
  };

  const renderSelect = (
    name: keyof Filtros,
    placeholder: string,
    items: string[],
    disabled: boolean = false
  ) => (
    <div className="flex-1 min-w-[180px]">
        <Select
            onValueChange={(v) => handleSelectChange(name, v)}
            value={filters[name] || ""}
            disabled={disabled || loading[name] || isPending}
        >
            <SelectTrigger className="bg-background">
                {(loading[name] || isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder={placeholder} />}
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => (
                    <SelectItem key={item} value={item}>
                        {item}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
            placeholder="Buscar por nome do grupo..."
            value={filters.nome_grupo || ""}
            onChange={(e) => setFilters(prev => ({ ...prev, nome_grupo: e.target.value }))}
            className="flex-1 min-w-[200px] bg-background"
        />
        {renderSelect(
          "centro_de_localizacao",
          "Centro de Localização",
          options.centrosLocalizacao
        )}
        {renderSelect(
            "fase",
            "Fase",
            options.fases,
            !filters.centro_de_localizacao
        )}
        {renderSelect(
            "categoria",
            "Categoria",
            options.categorias,
            !filters.centro_de_localizacao
        )}
        <Button onClick={clearFilters} variant="ghost" className="h-10">
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
        </Button>
      </div>
    </div>
  );
}
