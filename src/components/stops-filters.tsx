
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
import { Loader2, X, Calendar as CalendarIcon } from "lucide-react";
import type { ParadasFiltros } from "@/app/paradas/page";
import { getHierarquiaOpcoes } from "@/lib/data";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { type DateRange } from "react-day-picker";


interface StopsFiltersProps {
  onFilterChange: (filters: ParadasFiltros) => void;
}

export function StopsFilters({ onFilterChange }: StopsFiltersProps) {
  const [filters, setFilters] = useState<ParadasFiltros>({});
  
  const [diretoriaExecutivaOptions, setDiretoriaExecutivaOptions] = useState<string[]>([]);
  const [diretoriaOptions, setDiretoriaOptions] = useState<string[]>([]);
  const [centroOptions, setCentroOptions] = useState<string[]>([]);
  const [faseOptions, setFaseOptions] = useState<string[]>([]);
  
  const [loadingDE, setLoadingDE] = useState(true);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingCentros, setLoadingCentros] = useState(false);
  const [loadingFases, setLoadingFases] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
        setLoadingDE(true);
        const de = await getHierarquiaOpcoes("diretoria_executiva");
        setDiretoriaExecutivaOptions(de);
        setLoadingDE(false);
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchDiretorias = async () => {
      if (filters.diretoria_executiva) {
        setLoadingD(true);
        const d = await getHierarquiaOpcoes("diretoria", { diretoria_executiva: filters.diretoria_executiva });
        setDiretoriaOptions(d);
        setLoadingD(false);
      } else {
        setDiretoriaOptions([]);
      }
    }
    fetchDiretorias();
  }, [filters.diretoria_executiva]);

  useEffect(() => {
    const fetchCentros = async () => {
      if(filters.diretoria) {
        setLoadingCentros(true);
        const centros = await getHierarquiaOpcoes("centro_de_localizacao", { diretoria: filters.diretoria });
        setCentroOptions(centros);
        setLoadingCentros(false);
      } else {
        setCentroOptions([]);
      }
    }
    fetchCentros();
  }, [filters.diretoria]);

  useEffect(() => {
    const fetchFases = async () => {
      if (filters.centro_de_localizacao) {
        setLoadingFases(true);
        const fases = await getHierarquiaOpcoes("fase", { centro_de_localizacao: filters.centro_de_localizacao });
        setFaseOptions(fases);
        setLoadingFases(false);
      } else {
        setFaseOptions([]);
      }
    };
    fetchFases();
  }, [filters.centro_de_localizacao]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);


  const handleSelectChange = (name: keyof Omit<ParadasFiltros, 'dateRange'>, value: string) => {
    const newValue = value === "todos" ? undefined : value;
    
    setFilters(prev => {
        const newFilters: ParadasFiltros = { ...prev, [name]: newValue };
        if (name === 'diretoria_executiva') {
            delete newFilters.diretoria;
            delete newFilters.centro_de_localizacao;
            delete newFilters.fase;
        }
        if (name === 'diretoria') {
            delete newFilters.centro_de_localizacao;
            delete newFilters.fase;
        }
        if (name === 'centro_de_localizacao') {
            delete newFilters.fase;
        }
        return newFilters;
    });
  };

  const handleDateChange = (range: DateRange | undefined) => {
     setFilters(prev => ({ ...prev, dateRange: range }));
  }
  
  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
       <div className="flex-1 min-w-[200px] space-y-2">
        <label className="text-sm font-medium">Diretoria Executiva</label>
        <Select 
            name="diretoria_executiva" 
            value={filters.diretoria_executiva || "todos"} 
            onValueChange={(v) => handleSelectChange("diretoria_executiva", v)}
            disabled={loadingDE}
        >
          <SelectTrigger>
            {loadingDE ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <SelectValue placeholder="Todas as diretorias" />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as diretorias</SelectItem>
            {diretoriaExecutivaOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-w-[200px] space-y-2">
        <label className="text-sm font-medium">Diretoria</label>
        <Select 
            name="diretoria" 
            value={filters.diretoria || "todos"} 
            onValueChange={(v) => handleSelectChange("diretoria", v)}
            disabled={!filters.diretoria_executiva || loadingD}
        >
          <SelectTrigger>
            {loadingD ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <SelectValue placeholder="Todas as diretorias" />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as diretorias</SelectItem>
            {diretoriaOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px] space-y-2">
        <label className="text-sm font-medium">Centro de Localização</label>
        <Select 
            name="centro_de_localizacao" 
            value={filters.centro_de_localizacao || "todos"} 
            onValueChange={(v) => handleSelectChange("centro_de_localizacao", v)}
            disabled={!filters.diretoria || loadingCentros}
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
      
      <div className="flex-1 min-w-[280px] space-y-2">
        <label className="text-sm font-medium">Período</label>
         <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y", { locale: ptBR })} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y", { locale: ptBR })}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y", { locale: ptBR })
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={handleDateChange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
      </div>


       <Button onClick={clearFilters} variant="ghost" className="h-10">
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
        </Button>
    </div>
  );
}
