
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
import { Loader2, X } from "lucide-react";
import type { ParadasFiltros } from "@/app/paradas/page";
import { getHierarquiaOpcoes } from "@/lib/data";


interface StopsFiltersProps {
  onFilterChange: (filters: ParadasFiltros) => void;
}

export function StopsFilters({ onFilterChange }: StopsFiltersProps) {
  const [filters, setFilters] = useState<ParadasFiltros>({});
  const [centroOptions, setCentroOptions] = useState<string[]>([]);
  const [faseOptions, setFaseOptions] = useState<string[]>([]);
  
  const [loadingCentros, setLoadingCentros] = useState(true);
  const [loadingFases, setLoadingFases] = useState(false);

  // Fetch initial options for centros
  useEffect(() => {
    const fetchOptions = async () => {
        setLoadingCentros(true);
        const centros = await getHierarquiaOpcoes("centro_de_localizacao");
        setCentroOptions(centros);
        setLoadingCentros(false);
    };
    fetchOptions();
  }, []);

  // Fetch fases when centro changes
  useEffect(() => {
    const fetchFases = async () => {
      if (filters.centro_de_localizacao) {
        setLoadingFases(true);
        const fases = await getHierarquiaOpcoes("fase", { centro_de_localizacao: filters.centro_de_localizacao });
        setFaseOptions(fases);
        setLoadingFases(false);
      } else {
        setFaseOptions([]); // Clear fases if no centro is selected
      }
    };
    fetchFases();
  }, [filters.centro_de_localizacao]);


  // Propagate changes up
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 300); // Debounce
    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);


  const handleSelectChange = (name: keyof ParadasFiltros, value: string) => {
    const newValue = value === "todos" ? undefined : value;
    
    setFilters(prev => {
        const newFilters = { ...prev, [name]: newValue };
        // If centro is changed, reset fase
        if (name === 'centro_de_localizacao') {
            delete newFilters.fase;
        }
        return newFilters;
    });
  };
  
  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px] space-y-2">
        <label className="text-sm font-medium">Centro de Localização</label>
        <Select 
            name="centro_de_localizacao" 
            value={filters.centro_de_localizacao || "todos"} 
            onValueChange={(v) => handleSelectChange("centro_de_localizacao", v)}
            disabled={loadingCentros}
        >
          <SelectTrigger>
            {loadingCentros ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <SelectValue placeholder="Todos os centros" />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os centros</SelectItem>
            {centroOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 min-w-[200px] space-y-2">
        <label className="text-sm font-medium">Fase</label>
        <Select 
            name="fase" 
            value={filters.fase || "todos"} 
            onValueChange={(v) => handleSelectChange("fase", v)}
            disabled={!filters.centro_de_localizacao || loadingFases}
        >
          <SelectTrigger>
            {loadingFases ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <SelectValue placeholder="Todas as fases" />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as fases</SelectItem>
            {faseOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

       <Button onClick={clearFilters} variant="ghost" className="h-10">
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
        </Button>
    </div>
  );
}
