
import React from "react";
import { getMonth, getISOWeek, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CronogramaFiltros } from "./schedule-filters";

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
    filters: CronogramaFiltros;
}

const priorityColors: Record<string, string> = {
    ALTA: "bg-red-500",
    MEDIA: "bg-orange-500",
    BAIXA: "bg-blue-500",
};

const stopColor = "bg-green-500";


export function ScheduleView({ data, year, filters }: ScheduleViewProps) {
    const [view, setView] = React.useState<"semanas" | "meses">("semanas");
    const { mes: selectedMonth, semana: selectedWeek } = filters;

    const timeIntervals = React.useMemo(() => {
        if (view === 'meses') {
            return Array.from({ length: 12 }, (_, i) => ({
                label: format(new Date(year, i, 1), "MMM", { locale: ptBR }).toUpperCase(),
                value: i + 1
            }));
        }
        // Semanas
        return Array.from({ length: 52 }, (_, i) => ({ label: `S${i + 1}`, value: i + 1 }));
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
    
    const processedData = React.useMemo(() => {
        return data.map(group => ({
            ...group,
            strategies: group.items.filter(item => item.type === 'strategy'),
            stops: group.items.filter(item => item.type === 'stop'),
        }));
    }, [data]);

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
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-64">
                                    Grupo / Ativo
                                </th>
                                 <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-64 bg-gray-50 z-10 w-32">
                                    Tipo
                                </th>
                                {timeIntervals.map(interval => (
                                    <th key={interval.value} scope="col" className={cn(
                                        "px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10",
                                        (view === 'meses' && selectedMonth === interval.value.toString()) && "bg-blue-100",
                                        (view === 'semanas' && selectedWeek === interval.value.toString()) && "bg-blue-100"
                                    )}>
                                        {interval.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {processedData.map((group) => (
                                <React.Fragment key={`${group.groupName}-${group.location}`}>
                                    <tr className="bg-white">
                                        <td rowSpan={2} className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 w-64 border-b">
                                            <div className="truncate" title={group.groupName}>
                                                <p className="font-semibold">{group.groupName}</p>
                                                <p className="text-xs text-muted-foreground">{group.location}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 sticky left-64 bg-white z-10 w-32 border-b">
                                            Estratégias
                                        </td>
                                        {timeIntervals.map(interval => (
                                            <td key={interval.value} className={cn(
                                                "px-1 py-1 text-center border-l border-b w-10",
                                                (view === 'meses' && selectedMonth === interval.value.toString()) && "bg-blue-50",
                                                (view === 'semanas' && selectedWeek === interval.value.toString()) && "bg-blue-50"
                                            )}>
                                                <div className="h-full w-full flex flex-wrap items-center justify-center gap-1">
                                                    {group.strategies.map(item =>
                                                        getPosition(item, interval.value) && (
                                                            <Tooltip key={item.id}>
                                                                <TooltipTrigger>
                                                                    <div
                                                                        className={cn(
                                                                            "h-3 w-3 rounded-sm",
                                                                            priorityColors[item.priority || 'BAIXA']
                                                                        )}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="font-bold">{item.name}</p>
                                                                    <p>Início: {format(item.startDate, "dd/MM/yyyy")}</p>
                                                                    <p>Fim: {format(item.endDate, "dd/MM/yyyy")}</p>
                                                                    {item.priority && <p>Prioridade: {item.priority}</p>}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="bg-white">
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 sticky left-64 bg-white z-10 w-32 border-b">
                                            Paradas
                                        </td>
                                        {timeIntervals.map(interval => (
                                            <td key={interval.value} className={cn(
                                                "px-1 py-1 text-center border-l border-b w-10",
                                                 (view === 'meses' && selectedMonth === interval.value.toString()) && "bg-blue-50",
                                                 (view === 'semanas' && selectedWeek === interval.value.toString()) && "bg-blue-50"
                                            )}>
                                                <div className="h-full w-full flex flex-wrap items-center justify-center gap-1">
                                                    {group.stops.map(item =>
                                                        getPosition(item, interval.value) && (
                                                            <Tooltip key={item.id}>
                                                                <TooltipTrigger>
                                                                    <div
                                                                        className={cn(
                                                                            "h-3 w-3 rounded-sm",
                                                                            stopColor
                                                                        )}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="font-bold">{item.name}</p>
                                                                    <p>Início: {format(item.startDate, "dd/MM/yyyy")}</p>
                                                                    <p>Fim: {format(item.endDate, "dd/MM/yyyy")}</p>
                                                                    {item.status && <p>Status: {item.status}</p>}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </TooltipProvider>
    );
}
