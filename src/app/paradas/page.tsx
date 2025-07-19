
"use client";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { StopCard, type Stop } from "@/components/stop-card";
import { StopsFilters } from "@/components/stops-filters";
import { useState, useCallback, useEffect } from "react";
import { getStops } from "@/lib/data";
import { type DateRange } from "react-day-picker";

export type ParadasFiltros = {
  diretoria_executiva?: string;
  diretoria?: string;
  centro_de_localizacao?: string;
  fase?: string;
  dateRange?: DateRange;
};

export default function ParadasPage() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ParadasFiltros>({});

  useEffect(() => {
    const fetchStops = async () => {
        setIsLoading(true);
        const data = await getStops(filters);
        setStops(data);
        setIsLoading(false);
    };
    fetchStops();
  }, [filters]);


  const handleFilterChange = useCallback((newFilters: ParadasFiltros) => {
    setFilters(newFilters);
  }, []);

  const handleStopDelete = (deletedStopId: string) => {
    setStops(currentStops =>
      currentStops.filter(s => s.id !== deletedStopId)
    );
  };

  return (
    <MainLayout>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/20 space-y-6">
        <Card>
           <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                         <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Cadastro de Paradas de Manutenção</CardTitle>
                        <CardDescription>
                            Gerencie as paradas de manutenção por centro de localização e fase
                        </CardDescription>
                    </div>
                </div>
                <Button asChild>
                  <Link href="/paradas/criar">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Parada
                  </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <StopsFilters onFilterChange={handleFilterChange} />
            </CardContent>
        </Card>
        
        <div className="space-y-4">
             {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <h2 className="mt-6 text-2xl font-semibold">Buscando Paradas...</h2>
                    <p className="mt-2 text-muted-foreground">Aguarde um momento.</p>
                </div>
             ) : stops.length > 0 ? (
                 stops.map((stop) => (
                    <StopCard key={stop.id} stop={stop} onStopDelete={handleStopDelete} />
                 ))
             ) : (
                <div className="flex flex-col items-center justify-center text-center py-20">
                    <Settings className="w-16 h-16 text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-semibold">
                        Nenhuma Parada Encontrada
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Ajuste os filtros ou crie uma nova parada para vê-la listada aqui.
                    </p>
                </div>
             )}
        </div>
      </div>
    </MainLayout>
  );
}
