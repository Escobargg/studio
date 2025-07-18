
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
import { X } from "lucide-react";

interface StopsFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function StopsFilters({ onFilterChange }: StopsFiltersProps) {
  const [filters, setFilters] = useState({
    search: "",
    center: "",
    phase: "",
    year: "",
    month: "",
    week: "",
  });

  // Mock options - in a real app, these would come from an API
  const centerOptions = ["Todos os centros", "2001 - Mina Carajás", "3050 - Usina Vitória", "6002 - Mariana"];
  const phaseOptions = ["Todas as fases", "MINA", "USINA"];
  const yearOptions = ["2025", "2024", "2023"];
  const monthOptions = ["Todos os meses", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekOptions = ["Todas as semanas", "Semana 1", "Semana 2", "Semana 3", "Semana 4"];

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500); // Debounce
    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // If the "All" option is selected, reset the filter value to an empty string.
    if (value.startsWith("Todos")) {
      setFilters(prev => ({ ...prev, [name]: "" }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const clearFilters = () => {
    setFilters({
        search: "",
        center: "",
        phase: "",
        year: "",
        month: "",
        week: "",
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
      <div className="space-y-2">
        <label className="text-sm font-medium">Pesquisar</label>
        <Input
          name="search"
          placeholder="Nome da parada..."
          value={filters.search}
          onChange={handleInputChange}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Centro de Localização</label>
        <Select name="center" value={filters.center || "Todos os centros"} onValueChange={(v) => handleSelectChange("center", v)}>
          <SelectTrigger><SelectValue placeholder="Todos os centros" /></SelectTrigger>
          <SelectContent>
            {centerOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Fase</label>
        <Select name="phase" value={filters.phase || "Todas as fases"} onValueChange={(v) => handleSelectChange("phase", v)}>
          <SelectTrigger><SelectValue placeholder="Todas as fases" /></SelectTrigger>
          <SelectContent>
            {phaseOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Ano</label>
        <Select name="year" value={filters.year} onValueChange={(v) => handleSelectChange("year", v)}>
          <SelectTrigger><SelectValue placeholder="Selecione o ano" /></SelectTrigger>
          <SelectContent>
            {yearOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
       <div className="space-y-2">
        <label className="text-sm font-medium">Mês</label>
        <Select name="month" value={filters.month || "Todos os meses"} onValueChange={(v) => handleSelectChange("month", v)}>
          <SelectTrigger><SelectValue placeholder="Todos os meses" /></SelectTrigger>
          <SelectContent>
            {monthOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
       <div className="space-y-2">
        <label className="text-sm font-medium">Semana</label>
        <Select name="week" value={filters.week || "Todas as semanas"} onValueChange={(v) => handleSelectChange("week", v)}>
          <SelectTrigger><SelectValue placeholder="Todas as semanas" /></SelectTrigger>
          <SelectContent>
            {weekOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
