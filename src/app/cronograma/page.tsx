
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MainLayout } from "@/components/main-layout";
import { ScheduleView } from "@/components/schedule-view";
import { getScheduleData } from "@/lib/data";
import { Loader2, CalendarX2, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange } from "lucide-react";
import { ScheduleFilters, type CronogramaFiltros } from "@/components/schedule-filters";

export default function CronogramaPage() {
    const [filters, setFilters] = useState<CronogramaFiltros>({
        ano: new Date().getFullYear().toString(),
    });
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFiltered, setHasFiltered] = useState(false);

    const year = useMemo(() => parseInt(filters.ano || new Date().getFullYear().toString()), [filters.ano]);

    useEffect(() => {
        if (!hasFiltered) return;

        const fetchData = async () => {
            setIsLoading(true);
            const scheduleData = await getScheduleData(filters);
            setData(scheduleData);
            setIsLoading(false);
        };
        fetchData();
    }, [filters, hasFiltered]);

    const handleFilterChange = useCallback((newFilters: CronogramaFiltros) => {
        setFilters(newFilters);
        if (!hasFiltered) {
            setHasFiltered(true);
        }
    }, [hasFiltered]);

    return (
        <MainLayout>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-muted/20 space-y-4">
                 <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <CalendarRange className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Cronograma Anual</CardTitle>
                                    <CardDescription>
                                        Visualize o planejamento de estratégias e paradas de manutenção.
                                    </CardDescription>
                                </div>
                            </div>
                             <ScheduleFilters onFilterChange={handleFilterChange} initialFilters={filters} />
                        </div>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-96 text-center">
                                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                                <h2 className="mt-6 text-2xl font-semibold">Carregando Cronograma...</h2>
                                <p className="mt-2 text-muted-foreground">Aguarde um momento.</p>
                            </div>
                        ) : !hasFiltered ? (
                             <div className="flex flex-col items-center justify-center h-96 text-center">
                                <Filter className="w-16 h-16 text-muted-foreground" />
                                <h2 className="mt-6 text-2xl font-semibold">Selecione os Filtros</h2>
                                <p className="mt-2 text-muted-foreground">
                                    Utilize os filtros acima para carregar o cronograma.
                                </p>
                            </div>
                        ) : data.length > 0 ? (
                            <ScheduleView data={data} year={year} filters={filters} />
                        ) : (
                             <div className="flex flex-col items-center justify-center h-96 text-center">
                                <CalendarX2 className="w-16 h-16 text-muted-foreground" />
                                <h2 className="mt-6 text-2xl font-semibold">Nenhum Dado Encontrado</h2>
                                <p className="mt-2 text-muted-foreground">
                                    Não há estratégias ou paradas planejadas para os filtros selecionados.
                                </p>
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
        </MainLayout>
    );
}
