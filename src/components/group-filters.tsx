
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
  diretoriasExecutivas: string[];
  diretorias: string[];
  centrosLocalizacao: string[];
  fases: string[];
};

export function GroupFilters({ filters, onFilterChange }: GroupFiltersProps) {
  const [options, setOptions] = useState<OptionsState>({
    diretoriasExecutivas: [],
    diretorias: [],
    centrosLocalizacao: [],
    fases: [],
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(prev => ({ ...prev, diretoriasExecutivas: true }));
      const de = await getHierarquiaOpcoes("diretoria_executiva");
      setOptions(prev => ({ ...prev, diretoriasExecutivas: de }));
      setLoading(prev => ({ ...prev, diretoriasExecutivas: false }));
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    const de = filters.diretoria_executiva;
    if (de) {
      const fetchDiretorias = async () => {
        setLoading(prev => ({ ...prev, diretorias: true }));
        const diretorias = await getHierarquiaOpcoes('diretoria', { diretoria_executiva: de });
        setOptions(prev => ({ ...prev, diretorias }));
        setLoading(prev => ({ ...prev, diretorias: false }));
      };
      fetchDiretorias();
    } else {
      setOptions(prev => ({ ...prev, diretorias: [], centrosLocalizacao: [], fases: [] }));
    }
  }, [filters.diretoria_executiva]);

  useEffect(() => {
    const diretoria = filters.diretoria;
    if (diretoria) {
      const fetchCentros = async () => {
        setLoading(prev => ({ ...prev, centrosLocalizacao: true }));
        const centros = await getHierarquiaOpcoes('centro_de_localizacao', { diretoria: diretoria });
        setOptions(prev => ({ ...prev, centrosLocalizacao: centros }));
        setLoading(prev => ({ ...prev, centrosLocalizacao: false }));
      };
      fetchCentros();
    } else {
       setOptions(prev => ({ ...prev, centrosLocalizacao: [], fases: [] }));
    }
  }, [filters.diretoria]);


  useEffect(() => {
    const centro = filters.centro_de_localizacao;
    if (centro) {
        const fetchDependentOptions = async () => {
            setLoading(prev => ({ ...prev, fases: true }));
            const fasesData = await getHierarquiaOpcoes('fase', {centro_de_localizacao: centro});
            setOptions(prev => ({...prev, fases: fasesData}));
            setLoading(prev => ({ ...prev, fases: false }));
        };
        fetchDependentOptions();
    } else {
        setOptions(prev => ({...prev, fases: []}));
    }
  }, [filters.centro_de_localizacao]);

  const handleInputChange = (field: keyof Filtros, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };
  
  const handleSelectChange = (field: keyof Filtros, value: string) => {
    const newFilters: Filtros = { ...filters, [field]: value };

    if (field === 'diretoria_executiva') {
        delete newFilters.diretoria;
        delete newFilters.centro_de_localizacao;
        delete newFilters.fase;
    } else if (field === 'diretoria') {
        delete newFilters.centro_de_localizacao;
        delete newFilters.fase;
    } else if (field === 'centro_de_localizacao') {
      delete newFilters.fase;
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
          "diretoria_executiva",
          "Diretoria Executiva",
          options.diretoriasExecutivas
        )}
        {renderSelect(
          "diretoria",
          "Diretoria",
          options.diretorias,
          !filters.diretoria_executiva
        )}
        {renderSelect(
          "centro_de_localizacao",
          "Centro de Localização",
          options.centrosLocalizacao,
          !filters.diretoria
        )}
        {renderSelect(
            "fase",
            "Fase",
            options.fases,
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
