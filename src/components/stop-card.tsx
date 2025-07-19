
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export type Stop = {
  id: string;
  nome_parada: string;
  centro_de_localizacao: string;
  fase: string;
  tipo_selecao: 'grupo' | 'ativo';
  grupo_de_ativos?: string;
  ativo_unico?: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  data_inicio_realizado?: string;
  data_fim_realizado?: string;
  duracao_planejada_horas: number;
  descricao?: string;
};

interface StopCardProps {
    stop: Stop;
}

const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return "N/A";
    const startDate = format(new Date(start), "dd/MM/yyyy", { locale: ptBR });
    const endDate = format(new Date(end), "dd/MM/yyyy", { locale: ptBR });
    return `${startDate} - ${endDate}`;
}

export function StopCard({ stop }: StopCardProps) {

  const completion = 0; // Placeholder for now

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 border-border/60">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-xl font-bold">{stop.nome_parada}</h3>
              <Badge variant="secondary">{stop.centro_de_localizacao}</Badge>
              <Badge>{stop.fase}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
                {stop.tipo_selecao === 'grupo' ? `Grupo: ${stop.grupo_de_ativos}` : `Ativo: ${stop.ativo_unico}`}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
             <div className="w-32 text-right">
                <div className="flex items-center justify-end gap-2">
                    <span className="text-red-500 font-bold">{completion}%</span>
                    <Progress value={completion} className="h-2 w-20" />
                </div>
                <p className="text-xs text-muted-foreground">Conclusão</p>
            </div>
            <Button variant="ghost" size="icon">
              <Edit className="w-4 h-4" />
              <span className="sr-only">Editar Parada</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Excluir Parada</span>
            </Button>
          </div>
        </div>

        <Separator />
        
        {/* Details */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium text-foreground">Planejada:</span>
                <span>{formatDateRange(stop.data_inicio_planejada, stop.data_fim_planejada)}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Realizada:</span>
                <span>{stop.data_inicio_realizado ? formatDateRange(stop.data_inicio_realizado, stop.data_fim_realizado!) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{stop.duracao_planejada_horas}h</span>
            </div>
        </div>

        {/* Description */}
        {stop.descricao && (
             <p className="text-sm text-muted-foreground pt-2">
                {stop.descricao}
            </p>
        )}
      </div>
    </Card>
  );
}

    