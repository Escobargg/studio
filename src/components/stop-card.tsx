
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, CheckCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Separator } from "./ui/separator";

export type StopCardProps = {
  id: string;
  title: string;
  center: string;
  phase: string;
  group: string;
  plannedDate: string;
  actualDate: string;
  durationHours: number;
  teamsCount: number;
  totalManHours: number;
  description: string;
  completion: number;
};

export function StopCard({
  id,
  title,
  center,
  phase,
  group,
  plannedDate,
  actualDate,
  durationHours,
  teamsCount,
  totalManHours,
  description,
  completion,
}: StopCardProps) {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 border-border/60">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-xl font-bold">{title}</h3>
              <Badge variant="secondary">{center}</Badge>
              <Badge>{phase}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Grupo: {group}</p>
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
                <span>{plannedDate}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Realizada:</span>
                <span>{actualDate}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{durationHours}h</span>
            </div>
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{teamsCount} {teamsCount > 1 ? 'equipes' : 'equipe'}</span>
            </div>
            <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{totalManHours} HH total</span>
            </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground pt-2">
            {description}
        </p>
      </div>
    </Card>
  );
}

