
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEquipes } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Users } from "lucide-react";

export type Team = {
  id: string;
  especialidade: string;
  hh: number;
};

export type SelectedTeam = {
  id: string;
  especialidade: string;
  capacidade?: number;
  hh?: number;
  total_hh?: number;
};

interface TeamSelectorProps {
  value: SelectedTeam[];
  onChange: (value: SelectedTeam[]) => void;
  duracaoHoras: number;
  centroLocalizacao: string;
  fase: string;
}

export function TeamSelector({ 
  value: selectedTeams = [], 
  onChange, 
  duracaoHoras,
  centroLocalizacao,
  fase
}: TeamSelectorProps) {
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTeams() {
      if (centroLocalizacao && fase) {
        setLoading(true);
        const teams = await getEquipes({ centro_de_localizacao: centroLocalizacao, fase });
        setAvailableTeams(teams);
        
        // Filter out selected teams that are no longer available
        const availableTeamIds = new Set(teams.map(t => t.id));
        const newSelectedTeams = selectedTeams.filter(st => availableTeamIds.has(st.id));
        if (newSelectedTeams.length !== selectedTeams.length) {
          onChange(newSelectedTeams);
        }
        
        setLoading(false);
      } else {
        setAvailableTeams([]);
        onChange([]); // Clear selection if filters are cleared
      }
    }
    fetchTeams();
  }, [centroLocalizacao, fase]);

  const calculatedTeams = useMemo(() => {
    return selectedTeams.map(team => {
      const availableTeam = availableTeams.find(at => at.id === team.id);
      const hh = availableTeam?.hh || 0;
      const capacidade = team.capacidade || 0;
      // Ajuste no cálculo para considerar HH/Dia
      const total_hh = capacidade * hh * (duracaoHoras > 0 ? (duracaoHoras / 24) : 0);

      return {
        ...team,
        hh,
        total_hh: Math.round(total_hh)
      };
    });
  }, [selectedTeams, availableTeams, duracaoHoras]);

  useEffect(() => {
    const hasChanged = JSON.stringify(calculatedTeams) !== JSON.stringify(selectedTeams);
    if(hasChanged) {
        onChange(calculatedTeams);
    }
  }, [calculatedTeams, selectedTeams, onChange]);
  

  const handleTeamSelectionChange = useCallback((team: Team, checked: boolean) => {
    let newSelectedTeams: SelectedTeam[];
    if (checked) {
      newSelectedTeams = [...selectedTeams, { ...team, capacidade: 1 }];
    } else {
      newSelectedTeams = selectedTeams.filter((t) => t.id !== team.id);
    }
    onChange(newSelectedTeams);
  }, [selectedTeams, onChange]);

  const handleCapacityChange = useCallback((teamId: string, capacityStr: string) => {
    const capacity = parseInt(capacityStr, 10) || 0;
    const newSelectedTeams = selectedTeams.map(team =>
      team.id === teamId ? { ...team, capacidade: capacity } : team
    );
    onChange(newSelectedTeams);
  }, [selectedTeams, onChange]);
  
  if (!centroLocalizacao || !fase) {
      return (
        <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Selecione Local e Fase</AlertTitle>
            <AlertDescription>
                Por favor, selecione um Centro de Localização e uma Fase para carregar as equipes disponíveis.
            </AlertDescription>
        </Alert>
      );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Separator />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (availableTeams.length === 0) {
       return (
        <Alert variant="destructive">
            <Users className="h-4 w-4" />
            <AlertTitle>Nenhuma Equipe Encontrada</AlertTitle>
            <AlertDescription>
                Não há equipes cadastradas para o Centro de Localização e Fase selecionados.
            </AlertDescription>
        </Alert>
      );
  }


  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Equipes e Capacidade</Label>
        <div className="mt-2 flex flex-wrap gap-4 rounded-lg border p-4">
          {availableTeams.map((team) => (
            <div key={team.id} className="flex items-center space-x-2">
              <Checkbox
                id={`team-${team.id}`}
                checked={selectedTeams.some((t) => t.id === team.id)}
                onCheckedChange={(checked) => handleTeamSelectionChange(team, !!checked)}
              />
              <Label htmlFor={`team-${team.id}`} className="font-normal">
                {team.especialidade}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {calculatedTeams.length > 0 && (
        <div>
          <Label className="text-base font-medium">Detalhes por Equipe</Label>
          <div className="mt-2 space-y-4">
            {calculatedTeams.map((team) => (
              <div key={team.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-2 border rounded-md">
                <Label className="font-semibold">{team.especialidade}</Label>
                <div className="space-y-1">
                    <Label htmlFor={`capacity-${team.id}`}>Capacidade</Label>
                    <Select
                        value={String(team.capacidade || "1")}
                        onValueChange={(val) => handleCapacityChange(team.id, val)}
                    >
                        <SelectTrigger id={`capacity-${team.id}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[...Array(10).keys()].map(i => (
                                <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor={`hh-${team.id}`}>HH</Label>
                    <Input id={`hh-${team.id}`} disabled value={team.hh || ''} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor={`total-hh-${team.id}`}>HH/Parada</Label>
                    <Input id={`total-hh-${team.id}`} disabled value={team.total_hh || ''} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
