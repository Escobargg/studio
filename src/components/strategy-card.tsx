
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, CheckCircle, Clock, Edit, PauseCircle, Play, Trash2 } from "lucide-react";

export type Strategy = {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "ATIVA" | "INATIVA";
  description: string;
  frequency: string;
  duration: string;
  startDate: string;
};

interface StrategyCardProps {
  strategy: Strategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const isAtiva = strategy.status === "ATIVA";

  const priorityClasses = {
    LOW: "bg-blue-100 text-blue-800 border-blue-300",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
    HIGH: "bg-red-100 text-red-800 border-red-300",
  };
  
  const statusClasses = isAtiva
    ? "bg-green-100 text-green-800 border-green-300"
    : "bg-gray-100 text-gray-800 border-gray-300";


  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 border-border/60">
        <div className="p-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div className="flex items-center gap-3 flex-1">
                    {isAtiva ? (
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                        <PauseCircle className="h-6 w-6 text-gray-500 flex-shrink-0" />
                    )}
                    <div>
                        <h2 className="text-lg font-semibold">{strategy.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge variant="outline" className={priorityClasses[strategy.priority]}>{strategy.priority}</Badge>
                           <Badge variant="outline" className={statusClasses}>{strategy.status}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <Switch id={`status-switch-${strategy.id}`} checked={isAtiva} />
                    <label htmlFor={`status-switch-${strategy.id}`} className="text-sm font-medium mr-4">{strategy.status}</label>
                    <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mt-4 ml-9">{strategy.description}</p>
            
            {/* Details */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-4 ml-9 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <span className="text-muted-foreground">Frequência:</span>
                        <p className="font-medium">{strategy.frequency}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <span className="text-muted-foreground">Duração:</span>
                        <p className="font-medium">{strategy.duration}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <span className="text-muted-foreground">Início:</span>
                        <p className="font-medium">{strategy.startDate}</p>
                    </div>
                </div>
            </div>
        </div>
    </Card>
  );
}
