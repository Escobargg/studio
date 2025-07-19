
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Edit, Trash2, Users, ClipboardCheck, Loader2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useState, useEffect } from "react";
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
import { Progress } from "./ui/progress";

type Recurso = {
  equipe: string;
  hh_dia: number;
}

export type Stop = {
  id: string;
  id_parada: number;
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
    onStopDelete: (stopId: string) => void;
}

const formatDate = (date: string | undefined | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd/MM/yyyy HH:mm");
}

const calculateCompletion = (stop: Stop): number => {
  const now = new Date();
  
  // 1. Se tem data fim realizado, progresso é 100%
  if (stop.data_fim_realizado) {
    return 100;
  }

  // 2. Se tem data início realizado (mas não fim)
  if (stop.data_inicio_realizado) {
    const inicioRealizado = new Date(stop.data_inicio_realizado);
    const fimPlanejado = new Date(stop.data_fim_planejada);

    // 2.1 Se data atual > data fim planejada, progresso é 99% (atrasado)
    if (now > fimPlanejado) {
      return 99;
    }

    // 2.2 Cálculo proporcional em andamento
    const totalDuration = fimPlanejado.getTime() - inicioRealizado.getTime();
    if (totalDuration <= 0) return 99; // Evita divisão por zero, considera atrasado

    const elapsedDuration = now.getTime() - inicioRealizado.getTime();
    const percentage = Math.min(99, Math.max(0, (elapsedDuration / totalDuration) * 100)); // Limita a 99%
    
    return Math.round(percentage);
  }

  // 3. Se não tem início nem fim realizado, progresso é 0%
  return 0;
};


export function StopCard({ stop, onStopDelete }: StopCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    // Calculate completion on the client-side to avoid hydration mismatch
    setCompletion(calculateCompletion(stop));
  }, [stop]);


  const equipesStr = stop.recursos.map(r => r.equipe).join(', ');
  const hierarchyStr = [stop.diretoria_executiva, stop.diretoria, stop.centro_de_localizacao, stop.fase].filter(Boolean).join(' - ');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        // First delete dependent resources
        await supabase
            .from('recursos_parada')
            .delete()
            .eq('parada_id', stop.id)
            .throwOnError();

        // Then delete the main stop record
        await supabase
            .from('paradas_de_manutencao')
            .delete()
            .eq('id', stop.id)
            .throwOnError();

        toast.success("Parada excluída com sucesso!");
        onStopDelete(stop.id);

    } catch (error: any) {
        toast.error("Falha ao excluir a parada. Tente novamente.");
        console.error("Error deleting stop:", error.message || error);
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300 border-border/60">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold">
              {stop.id_parada} - {stop.tipo_selecao === 'grupo' ? stop.grupo_de_ativos : stop.ativo_unico} - {stop.nome_parada}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{hierarchyStr}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon" asChild>
                <Link href={`/paradas/${stop.id}/editar`}>
                    <Edit className="w-4 h-4" />
                    <span className="sr-only">Editar Parada</span>
                </Link>
            </Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span className="sr-only">Excluir Parada</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a parada
                    <strong className="px-1">#{stop.id_parada} - {stop.nome_parada}</strong>
                    e todos os seus dados associados.
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
                    {isDeleting ? "Excluindo..." : "Sim, excluir parada"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
        
        {/* Completion Bar */}
        <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-muted-foreground">Progresso</span>
                <span className="text-xs font-semibold text-primary">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2"/>
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
