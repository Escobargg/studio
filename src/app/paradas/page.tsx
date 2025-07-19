
"use client";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { StopCard, type Stop } from "@/components/stop-card";
import { StopsFilters } from "@/components/stops-filters";
import { useState, useTransition, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";

async function getStops(): Promise<Stop[]> {
    const { data, error } = await supabase
        .from('paradas_de_manutencao')
        .select('*')
        .order('data_inicio_planejada', { ascending: true });

    if (error) {
        console.error("Error fetching stops:", error);
        return [];
    }
    return data;
}

export default function ParadasPage() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStops = async () => {
        setIsLoading(true);
        const data = await getStops();
        setStops(data);
        setIsLoading(false);
    };
    fetchStops();
  }, [])


  const handleFilterChange = useCallback((filters: any) => {
    // Placeholder for filter logic
    console.log("Applying filters:", filters);
    // In a real app, you would fetch data from the server here based on filters
  }, []);

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
             ) : stops.map((stop) => (
                <StopCard key={stop.id} stop={stop} />
             ))}
        </div>
      </div>
    </MainLayout>
  );
}

    