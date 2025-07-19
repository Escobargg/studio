
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
  const [loading, setLoading] = useState(true);

  // Fetch initial options
  useEffect(() => {
    const fetchOptions = async () => {
        setLoading(true);
        const centros = await getHierarquiaOpcoes("centro_de_localizacao");
        setCentroOptions(centros);
        setLoading(false);
    };
    fetchOptions();
  }, []);

  // Propagate changes up
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 300); // Debounce
    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);


  const handleSelectChange = (name: keyof ParadasFiltros, value: string) => {
    // If the "All" option is selected, reset the filter value.
    const newValue = value === "todos" ? undefined : value;
    setFilters(prev => ({ ...prev, [name]: newValue }));
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
            disabled={loading}
        >
          <SelectTrigger>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <SelectValue placeholder="Todos os centros" />}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os centros</SelectItem>
            {centroOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
       <Button onClick={clearFilters} variant="ghost" className="h-10">
            <X className="mr-2 h-4 w-4" />
            Limpar Filtro
        </Button>
    </div>
  );
}
