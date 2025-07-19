
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Edit, Trash2, Users, ClipboardCheck } from "lucide-react";
import { Separator } from "./ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Recurso = {
  equipe: string;
  hh_dia: number;
}

export type Stop = {
  id: string;
  nome_parada: string;
  diretoria_executiva: string;
  diretoria: string;
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
  recursos: Recurso[];
  num_equipes: number;
  total_hh: number;
};

interface StopCardProps {
    stop: Stop;
}

const formatDate = (date: string | undefined | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
}

export function StopCard({ stop }: StopCardProps) {

  const completion = 0; // Placeholder for now

  const equipesStr = stop.recursos.map(r => r.equipe).join(', ');

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
             <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                    <span className="text-red-500 font-bold">{completion}%</span>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium text-foreground">Planejada:</span>
                <span>{formatDate(stop.data_inicio_planejada)} - {formatDate(stop.data_fim_planejada)}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Realizada:</span>
                <span>{formatDate(stop.data_inicio_realizado)} - {formatDate(stop.data_fim_realizado)}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{stop.duracao_planejada_horas}h</span>
            </div>
             <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{stop.num_equipes} equipes</span>
            </div>
             <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                <span>{stop.total_hh} HH total</span>
            </div>
        </div>

        {/* Description */}
        {(stop.descricao || equipesStr) && (
             <p className="text-sm text-muted-foreground pt-2">
                {stop.descricao}
                {stop.descricao && equipesStr ? " - " : ""}
                {equipesStr && `Equipes: ${equipesStr}`}
            </p>
        )}
      </div>
    </Card>
  );
}
