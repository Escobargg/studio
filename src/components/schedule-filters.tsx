
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { getHierarquiaOpcoes } from "@/lib/data";

export type CronogramaFiltros = {
  diretoria_executiva?: string;
  diretoria?: string;
  centro_de_localizacao?: string;
  fase?: string;
  ano?: string;
};

interface ScheduleFiltersProps {
  onFilterChange: (filters: CronogramaFiltros) => void;
  initialFilters: CronogramaFiltros;
}

export function ScheduleFilters({ onFilterChange, initialFilters }: ScheduleFiltersProps) {
  const [filters, setFilters] = useState<CronogramaFiltros>(initialFilters);
  
  const [diretoriaExecutivaOptions, setDiretoriaExecutivaOptions] = useState<string[]>([]);
  const [diretoriaOptions, setDiretoriaOptions] = useState<string[]>([]);
  const [centroOptions, setCentroOptions] = useState<string[]>([]);
  const [faseOptions, setFaseOptions] = useState<string[]>([]);
  const [anoOptions, setAnoOptions] = useState<string[]>([]);
  
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchInitialOptions = async () => {
        setLoading({ de: true, ano: true });
        const [de, anos] = await Promise.all([
            getHierarquiaOpcoes("diretoria_executiva"),
            getYearOptions()
        ]);
        setDiretoriaExecutivaOptions(de);
        setAnoOptions(anos);
        setLoading({ de: false, ano: false });
    };
    fetchInitialOptions();
  }, []);

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        years.push(i.toString());
    }
    return years.reverse();
  };

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);


  const handleSelectChange = (name: keyof CronogramaFiltros, value: string) => {
    const newValue = value === "todos" ? undefined : value;
    
    setFilters(prev => {
        const newFilters: CronogramaFiltros = { ...prev, [name]: newValue };
        if (name === 'diretoria_executiva') {
            delete newFilters.diretoria;
            delete newFilters.centro_de_localizacao;
            delete newFilters.fase;
        } else if (name === 'diretoria') {
            delete newFilters.centro_de_localizacao;
            delete newFilters.fase;
        } else if (name === 'centro_de_localizacao') {
            delete newFilters.fase;
        }
        return newFilters;
    });
  };

   useEffect(() => {
    const fetchDiretorias = async () => {
      if (filters.diretoria_executiva) {
        setLoading(prev => ({...prev, d: true}));
        const d = await getHierarquiaOpcoes("diretoria", { diretoria_executiva: filters.diretoria_executiva });
        setDiretoriaOptions(d);
        setLoading(prev => ({...prev, d: false}));
      } else {
        setDiretoriaOptions([]);
      }
    }
    fetchDiretorias();
  }, [filters.diretoria_executiva]);

  useEffect(() => {
    const fetchCentros = async () => {
      if(filters.diretoria) {
        setLoading(prev => ({...prev, centros: true}));
        const centros = await getHierarquiaOpcoes("centro_de_localizacao", { diretoria: filters.diretoria });
        setCentroOptions(centros);
        setLoading(prev => ({...prev, centros: false}));
      } else {
        setCentroOptions([]);
      }
    }
    fetchCentros();
  }, [filters.diretoria]);

  useEffect(() => {
    const fetchFases = async () => {
      if (filters.centro_de_localizacao) {
        setLoading(prev => ({...prev, fases: true}));
        const fases = await getHierarquiaOpcoes("fase", { centro_de_localizacao: filters.centro_de_localizacao });
        setFaseOptions(fases);
        setLoading(prev => ({...prev, fases: false}));
      } else {
        setFaseOptions([]);
      }
    };
    fetchFases();
  }, [filters.centro_de_localizacao]);

  const clearFilters = () => {
    setFilters({ ano: new Date().getFullYear().toString() });
  };
  
  const renderSelect = (
    name: keyof CronogramaFiltros,
    placeholder: string,
    options: string[],
    loadingKey: string,
    disabled: boolean = false
  ) => (
      <Select 
        name={name} 
        value={filters[name] || "todos"} 
        onValueChange={(v) => handleSelectChange(name, v)}
        disabled={disabled || loading[loadingKey]}
      >
        <SelectTrigger className="bg-background min-w-[180px] flex-1">
          {loading[loadingKey] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <SelectValue placeholder={placeholder} />}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">{placeholder}</SelectItem>
          {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
        </SelectContent>
      </Select>
  )

  return (
    <div className="flex flex-wrap gap-2 items-end">
       {renderSelect("diretoria_executiva", "Diretoria Executiva", diretoriaExecutivaOptions, 'de')}
       {renderSelect("diretoria", "Diretoria", diretoriaOptions, 'd', !filters.diretoria_executiva)}
       {renderSelect("centro_de_localizacao", "Centro de Localização", centroOptions, 'centros', !filters.diretoria)}
       {renderSelect("fase", "Fase", faseOptions, 'fases', !filters.centro_de_localizacao)}
       {renderSelect("ano", "Ano", anoOptions, 'ano')}
       <Button onClick={clearFilters} variant="ghost" className="h-10">
            <X className="mr-2 h-4 w-4" />
            Limpar
        </Button>
    </div>
  );
}
