
"use client";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { StopCard, StopCardProps } from "@/components/stop-card";
import { StopsFilters } from "@/components/stops-filters";
import { useState, useTransition, useCallback } from "react";

// Mock data based on the image provided
const mockStops: StopCardProps[] = [
  {
    id: "1",
    title: "Parada Britadores Carajás 1",
    center: "2001 - Mina Carajás",
    phase: "MINA",
    group: "Britadores Carajás",
    plannedDate: "09/01/2025 - 17/01/2025",
    actualDate: "09/01/2025 - 17/01/2025",
    durationHours: 192,
    description: "Manutenção programada do grupo Britadores Carajás",
    completion: 0,
  },
  {
    id: "2",
    title: "Parada Fornos Alto Forno Vitória 3",
    center: "3050 - Usina Vitória",
    phase: "USINA",
    group: "Fornos Alto Forno Vitória",
    plannedDate: "04/01/2025 - 12/01/2025",
    actualDate: "04/01/2025 - 12/01/2025",
    durationHours: 192,
    description: "Manutenção programada do grupo Fornos Alto Forno Vitória",
    completion: 0,
  },
  {
    id: "3",
    title: "Parada Equipamentos Mariana Usina 4",
    center: "6002 - Mariana",
    phase: "USINA",
    group: "Equipamentos Mariana Usina",
    plannedDate: "27/01/2025 - 29/01/2025",
    actualDate: "27/01/2025 - 29/01/2025",
    durationHours: 48,
    description: "Manutenção programada do grupo Equipamentos Mariana Usina",
    completion: 0,
  },
];


export default function ParadasPage() {
  const [stops, setStops] = useState<StopCardProps[]>(mockStops);
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = useCallback((filters: any) => {
    // Placeholder for filter logic
    startTransition(() => {
        console.log("Applying filters:", filters);
        // In a real app, you would fetch data from the server here based on filters
        // For now, we'll just simulate a loading state
        setTimeout(() => {
            setStops(mockStops);
        }, 500);
    });
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
             {isPending ? (
                 <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <h2 className="mt-6 text-2xl font-semibold">Buscando Paradas...</h2>
                    <p className="mt-2 text-muted-foreground">Aguarde um momento.</p>
                </div>
             ) : stops.map((stop) => (
                <StopCard key={stop.id} {...stop} />
             ))}
        </div>
      </div>
    </MainLayout>
  );
}
