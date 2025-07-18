
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar, CheckCircle, Clock, Edit, PauseCircle, Play, ShieldAlert, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { Separator } from "./ui/separator";


export type Strategy = {
  id: string;
  title: string;
  priority: "BAIXA" | "MEDIA" | "ALTA";
  status: "ATIVA" | "INATIVA";
  description: string;
  frequency: string;
  duration: string;
  startDate: string;
  toleranceInDays?: number;
};

interface StrategyCardProps {
  groupId: string;
  strategy: Strategy;
  onStrategyUpdate: (strategy: Strategy) => void;
  onStrategyDelete: (strategyId: string) => void;
}

export function StrategyCard({ groupId, strategy, onStrategyUpdate, onStrategyDelete }: StrategyCardProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (checked: boolean) => {
    setIsUpdatingStatus(true);
    const newStatus = checked ? "ATIVA" : "INATIVA";
    
    try {
        const { error } = await supabase
            .from('estrategias')
            .update({ status: newStatus, ativa: checked })
            .eq('id', strategy.id)
            .throwOnError();

        const updatedStrategy = { ...strategy, status: newStatus };
        onStrategyUpdate(updatedStrategy);
        toast.success(`Estratégia ${newStatus.toLowerCase()}.`);
    } catch (error: any) {
        toast.error("Falha ao atualizar o status.");
        console.error("Error updating status:", error);
    } finally {
        setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        const { error } = await supabase
            .from('estrategias')
            .delete()
            .eq('id', strategy.id)
            .throwOnError();
        
        onStrategyDelete(strategy.id);
        toast.success("Estratégia excluída com sucesso.");
    } catch (error: any) {
        toast.error("Falha ao excluir a estratégia.");
        console.error("Error deleting strategy:", error);
    } finally {
        setIsDeleting(false);
    }
  };

  const isAtiva = strategy.status === "ATIVA";

  const priorityClasses = {
    BAIXA: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200",
    MEDIA: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200",
    ALTA: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
  };
  
  const statusClasses = isAtiva
    ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200";


  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 border-border/60">
      <div className="p-4 space-y-3">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-4 gap-y-2">
            
            {/* Left & Middle Section */}
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 min-w-0">
                {/* Left Section: Title & Badges */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {isAtiva ? (
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                        <PauseCircle className="h-6 w-6 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-lg font-semibold truncate" title={strategy.title}>{strategy.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={priorityClasses[strategy.priority]}>{strategy.priority}</Badge>
                            <Badge variant="outline" className={statusClasses}>{strategy.status}</Badge>
                        </div>
                    </div>
                </div>

                <Separator orientation="vertical" className="h-10 hidden md:block" />
                <Separator className="md:hidden" />
                
                {/* Middle Section: Details */}
                <div className="flex-1 grid grid-cols-2 lg:flex lg:items-center lg:justify-start gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                        <p className="text-muted-foreground text-xs">Frequência</p>
                        <p className="font-medium">{strategy.frequency}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                        <p className="text-muted-foreground text-xs">Duração</p>
                        <p className="font-medium">{strategy.duration}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        <div>
                        <p className="text-muted-foreground text-xs">Tolerância</p>
                        <p className="font-medium">{strategy.toleranceInDays ?? 0} dias</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-muted-foreground" />
                        <div>
                        <p className="text-muted-foreground text-xs">Início</p>
                        <p className="font-medium">{strategy.startDate}</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Right Section: Actions */}
            <div className="flex items-center gap-3 flex-shrink-0 justify-end">
                {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                <div className="flex items-center gap-2">
                    <Switch id={`status-switch-${strategy.id}`} checked={isAtiva} onCheckedChange={handleStatusChange} disabled={isUpdatingStatus} />
                    <label htmlFor={`status-switch-${strategy.id}`} className="text-sm font-medium">{isAtiva ? 'Ativa' : 'Inativa'}</label>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/grupos/${groupId}/estrategias/${strategy.id}/editar`}>
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">Editar</span>
                    </Link>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a estratégia
                            <strong className="px-1">{strategy.title}</strong>.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isDeleting ? "Excluindo..." : "Sim, excluir"}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>

        {/* Bottom Section: Description */}
        {strategy.description && (
          <div>
            <Separator className="my-2" />
            <p className="text-sm text-muted-foreground">{strategy.description}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
