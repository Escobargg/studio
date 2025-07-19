
import React from "react";
import { getMonth, getISOWeek, format, getDaysInMonth, getDate, startOfISOWeek, setISOWeek, addDays, isSameDay } from "date-fns";
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
    const { mes: selectedMonth, semana: selectedWeek } = filters;
    
    // Default view is weeks. If a month or week is selected, this is ignored.
    const [view, setView] = React.useState<"semanas" | "meses">("semanas");

    // Determine the current view mode based on filters.
    const currentViewMode = selectedMonth ? 'dias_mes' : selectedWeek ? 'dias_semana' : view;
    
    const timeIntervals = React.useMemo(() => {
        // Daily view for a selected month
        if (selectedMonth) {
            const monthIndex = parseInt(selectedMonth, 10) - 1;
            const daysInMonth = getDaysInMonth(new Date(year, monthIndex));
            return Array.from({ length: daysInMonth }, (_, i) => ({
                label: (i + 1).toString(),
                value: i + 1,
                date: new Date(year, monthIndex, i + 1),
            }));
        }
        // Daily view for a selected week
        if (selectedWeek) {
            const weekIndex = parseInt(selectedWeek, 10);
            // Use a date guaranteed to be in the first week of the year to avoid issues.
            const dateForWeek = setISOWeek(new Date(year, 0, 4), weekIndex);
            const startDay = startOfISOWeek(dateForWeek);
            return Array.from({ length: 7 }, (_, i) => {
                const day = addDays(startDay, i);
                return {
                    label: format(day, "d/EEE", { locale: ptBR }),
                    value: getDate(day),
                    date: day,
                }
            });
        }
        if (view === 'meses') {
            return Array.from({ length: 12 }, (_, i) => ({
                label: format(new Date(year, i, 1), "MMM", { locale: ptBR }).toUpperCase(),
                value: i + 1,
                date: new Date(year, i, 1),
            }));
        }
        // Default to weeks
        return Array.from({ length: 52 }, (_, i) => ({ 
            label: `S${i + 1}`, 
            value: i + 1,
            // Date is not needed for weekly view but keeps the object shape consistent
            date: new Date(year, 0, 1) 
        }));
    }, [view, year, selectedMonth, selectedWeek]);


    const getPosition = (item: ScheduleItem, interval: (typeof timeIntervals)[0]): boolean => {
         if (currentViewMode === 'dias_mes' || currentViewMode === 'dias_semana') {
            const intervalDate = interval.date;
            // Check if intervalDate is between item's start and end date (inclusive)
            return isSameDay(item.startDate, intervalDate) || 
                   isSameDay(item.endDate, intervalDate) ||
                   (item.startDate < intervalDate && item.endDate > intervalDate);
        }

        if (view === 'meses') { // Monthly view
            const itemStartMonth = getMonth(item.startDate) + 1;
            const itemEndMonth = getMonth(item.endDate) + 1;
            return interval.value >= itemStartMonth && interval.value <= itemEndMonth;
        }

        // Weekly view
        const itemStartWeek = getISOWeek(item.startDate);
        const itemEndWeek = getISOWeek(item.endDate);
        return interval.value >= itemStartWeek && interval.value <= itemEndWeek;
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
                    {currentViewMode !== 'dias_mes' && currentViewMode !== 'dias_semana' && (
                         <Select value={view} onValueChange={(v) => setView(v as "semanas" | "meses")}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Visualizar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semanas">Semanas</SelectItem>
                                <SelectItem value="meses">Meses</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
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
                                    <th key={interval.label} scope="col" className={cn(
                                        "p-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10",
                                        (currentViewMode === 'meses' && selectedMonth === interval.value.toString()) && "bg-blue-100",
                                        (currentViewMode === 'semanas' && selectedWeek === interval.value.toString()) && "bg-blue-100"
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
                                            <td key={interval.label} className={cn(
                                                "p-0 text-center border-l border-b w-10 h-10", // No padding, fixed height
                                                (currentViewMode === 'meses' && selectedMonth === interval.value.toString()) && "bg-blue-50",
                                                (currentViewMode === 'semanas' && selectedWeek === interval.value.toString()) && "bg-blue-50"
                                            )}>
                                                <div className="h-full w-full flex flex-col items-center justify-start gap-px py-1">
                                                    {group.strategies.map(item =>
                                                        getPosition(item, interval) && (
                                                            <Tooltip key={item.id}>
                                                                <TooltipTrigger className="w-full">
                                                                    <div
                                                                        className={cn(
                                                                            "h-2 w-full rounded-sm",
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
                                            <td key={interval.label} className={cn(
                                                "p-0 text-center border-l border-b w-10 h-10", // No padding, fixed height
                                                 (currentViewMode === 'meses' && selectedMonth === interval.value.toString()) && "bg-blue-50",
                                                 (currentViewMode === 'semanas' && selectedWeek === interval.value.toString()) && "bg-blue-50"
                                            )}>
                                                <div className="h-full w-full flex flex-col items-center justify-start gap-px py-1">
                                                    {group.stops.map(item =>
                                                        getPosition(item, interval) && (
                                                            <Tooltip key={item.id}>
                                                                <TooltipTrigger className="w-full">
                                                                    <div
                                                                        className={cn(
                                                                            "h-2 w-full rounded-sm",
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
