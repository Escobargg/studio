
"use client";

import { useState, useMemo } from "react";
import { getMonth, getISOWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ScheduleItem = {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    type: 'strategy' | 'stop';
    priority?: 'BAIXA' | 'MEDIA' | 'ALTA';
    status?: string;
};

export type ScheduleData = {
    groupName: string;
    location: string;
    items: ScheduleItem[];
};

interface ScheduleViewProps {
    data: ScheduleData[];
    year: number;
}

const priorityColors: Record<string, string> = {
    ALTA: "bg-red-500",
    MEDIA: "bg-orange-500",
    BAIXA: "bg-blue-500",
};

const stopColor = "bg-green-500";


export function ScheduleView({ data, year }: ScheduleViewProps) {
    const [view, setView] = useState<"semanas" | "meses">("semanas");

    const timeIntervals = useMemo(() => {
        if (view === 'meses') {
            return Array.from({ length: 12 }, (_, i) => ({
                label: format(new Date(year, i, 1), "MMM", { locale: ptBR }),
                value: i + 1
            }));
        }
        // Semanas
        return Array.from({ length: 52 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }));
    }, [view, year]);


    const getPosition = (item: ScheduleItem, intervalValue: number): boolean => {
        if (view === 'meses') {
            const itemStartMonth = getMonth(item.startDate) + 1;
            const itemEndMonth = getMonth(item.endDate) + 1;
            return intervalValue >= itemStartMonth && intervalValue <= itemEndMonth;
        }

        // Semanas
        const itemStartWeek = getISOWeek(item.startDate);
        const itemEndWeek = getISOWeek(item.endDate);
        return intervalValue >= itemStartWeek && intervalValue <= itemEndWeek;
    };
    
    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Select value={view} onValueChange={(v) => setView(v as "semanas" | "meses")}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Visualizar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semanas">Semanas</SelectItem>
                            <SelectItem value="meses">Meses</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-64 min-w-64">
                                    Grupo / Ativo
                                </th>
                                {timeIntervals.map(interval => (
                                    <th key={interval.value} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                        {interval.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((group, index) => (
                                <tr key={`${group.groupName}-${index}`}>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 w-64">
                                       <div className="truncate" title={group.groupName}>
                                          <p className="font-semibold">{group.groupName}</p>
                                          <p className="text-xs text-muted-foreground">{group.location}</p>
                                        </div>
                                    </td>
                                    {timeIntervals.map(interval => (
                                        <td key={interval.value} className="px-1 py-1 text-center border-l">
                                            <div className="h-full w-full flex flex-wrap items-center justify-center gap-1">
                                                {group.items.map(item =>
                                                    getPosition(item, interval.value) && (
                                                        <Tooltip key={item.id}>
                                                            <TooltipTrigger>
                                                                <div
                                                                    className={cn(
                                                                        "h-4 w-4 rounded-sm",
                                                                        item.type === 'strategy' ? priorityColors[item.priority || 'BAIXA'] : stopColor
                                                                    )}
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="font-bold">{item.name}</p>
                                                                <p>Início: {format(item.startDate, "dd/MM/yyyy")}</p>
                                                                <p>Fim: {format(item.endDate, "dd/MM/yyyy")}</p>
                                                                {item.type === 'strategy' && item.priority && <p>Prioridade: {item.priority}</p>}
                                                                {item.type === 'stop' && item.status && <p>Status: {item.status}</p>}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </TooltipProvider>
    );
}
