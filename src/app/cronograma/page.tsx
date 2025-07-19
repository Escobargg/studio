
"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { ScheduleView, type ScheduleData } from "@/components/schedule-view";
import { getScheduleData } from "@/lib/data";
import { Loader2, CalendarX2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange } from "lucide-react";

const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        years.push(i);
    }
    return years;
};

export default function CronogramaPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<ScheduleData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const yearOptions = getYearOptions();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const scheduleData = await getScheduleData(year);
            setData(scheduleData);
            setIsLoading(false);
        };
        fetchData();
    }, [year]);

    return (
        <MainLayout>
            <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-muted/20 space-y-4">
                 <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                            <div className="flex items-center gap-2">
                                <Select
                                    value={year.toString()}
                                    onValueChange={(value) => setYear(parseInt(value))}
                                >
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-96 text-center">
                                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                                <h2 className="mt-6 text-2xl font-semibold">Carregando Cronograma...</h2>
                                <p className="mt-2 text-muted-foreground">Aguarde um momento.</p>
                            </div>
                        ) : data.length > 0 ? (
                            <ScheduleView data={data} year={year} />
                        ) : (
                             <div className="flex flex-col items-center justify-center h-96 text-center">
                                <CalendarX2 className="w-16 h-16 text-muted-foreground" />
                                <h2 className="mt-6 text-2xl font-semibold">Nenhum Dado Encontrado</h2>
                                <p className="mt-2 text-muted-foreground">
                                    Não há estratégias ou paradas planejadas para o ano de {year}.
                                </p>
                            </div>
                        )}
                    </CardContent>
                 </Card>
            </div>
        </MainLayout>
    );
}
