
"use client";

import { useState, useEffect } from "react";
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
  filters: Filtros;
  onFilterChange: (filters: Filtros) => void;
}

type OptionsState = {
  centrosLocalizacao: string[];
  fases: string[];
  categorias: string[];
};

export function GroupFilters({ filters, onFilterChange }: GroupFiltersProps) {
  const [options, setOptions] = useState<OptionsState>({
    centrosLocalizacao: [],
    fases: [],
    categorias: [],
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(prev => ({ ...prev, centrosLocalizacao: true }));
      const centros = await getHierarquiaOpcoes("centro_de_localizacao");
      setOptions(prev => ({ ...prev, centrosLocalizacao: centros }));
      setLoading(prev => ({ ...prev, centrosLocalizacao: false }));
    };
    fetchInitial();
  }, []);
  
  useEffect(() => {
    const centro = filters.centro_de_localizacao;
    if (centro) {
        const fetchDependentOptions = async () => {
            setLoading(prev => ({ ...prev, fases: true, categorias: true }));
            const [fasesData, categoriasData] = await Promise.all([
               getHierarquiaOpcoes('fase', {centro_de_localizacao: centro}),
               getHierarquiaOpcoes('categoria', {centro_de_localizacao: centro})
            ]);
            setOptions(prev => ({...prev, fases: fasesData, categorias: categoriasData}));
            setLoading(prev => ({ ...prev, fases: false, categorias: false }));
        };
        fetchDependentOptions();
    } else {
        setOptions(prev => ({...prev, fases: [], categorias: []}));
    }
  }, [filters.centro_de_localizacao]);

  const handleInputChange = (field: keyof Filtros, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };
  
  const handleSelectChange = (field: keyof Filtros, value: string) => {
    const newFilters: Filtros = { ...filters, [field]: value };

    if (field === 'centro_de_localizacao' && !value) {
      // Clear dependent fields if the center is cleared
      delete newFilters.fase;
      delete newFilters.categoria;
    } else if (field === 'centro_de_localizacao') {
      // Reset subsequent fields when the center changes
      delete newFilters.fase;
      delete newFilters.categoria;
    }
    
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
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
            disabled={disabled || loading[name]}
        >
            <SelectTrigger className="bg-background">
                {loading[name] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SelectValue placeholder={placeholder} />}
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
            onChange={(e) => handleInputChange('nome_grupo', e.target.value)}
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
