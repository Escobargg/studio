
"use client";

import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEquipes } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Users } from "lucide-react";

export type Team = {
  id: string;
  especialidade: string;
  hh: number;
  capacidade: number;
};

// A estrutura que o react-hook-form vai gerenciar.
export type SelectedTeam = {
  id: string;
  especialidade?: string;
  capacidade: string | number;
  hh: string | number;
  total_hh: string | number;
};


interface TeamSelectorProps {
  value: SelectedTeam[];
  onChange: (value: SelectedTeam[]) => void;
  centroLocalizacao: string;
  fase: string;
}

export function TeamSelector({ 
  value: selectedTeams = [], 
  onChange, 
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
        
        // Valida se as equipes selecionadas ainda estão disponíveis após a mudança de filtro
        const availableTeamIds = new Set(teams.map(t => t.id));
        const validSelectedTeams = selectedTeams.filter(st => availableTeamIds.has(st.id));
        
        if (validSelectedTeams.length !== selectedTeams.length) {
          onChange(validSelectedTeams);
        }
        
        setLoading(false);
      } else {
        setAvailableTeams([]);
        // Limpa a seleção se os filtros forem limpos
        if (selectedTeams.length > 0) {
            onChange([]);
        }
      }
    }
    fetchTeams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centroLocalizacao, fase]);

  const updateTeamData = (teams: SelectedTeam[]): SelectedTeam[] => {
    return teams.map(st => {
      const teamDetails = availableTeams.find(at => at.id === st.id);
      const hh = teamDetails?.hh || 0;
      const capacidade = parseInt(String(st.capacidade), 10) || 0;
      const total_hh = capacidade * hh;
      
      return {
        ...st,
        especialidade: teamDetails?.especialidade || "Desconhecida",
        hh: String(hh),
        total_hh: String(Math.round(total_hh))
      };
    });
  };

  const handleTeamSelectionChange = useCallback((team: Team, checked: boolean) => {
    let newSelectedTeams: SelectedTeam[];
    if (checked) {
      newSelectedTeams = [...selectedTeams, { 
        id: team.id, 
        capacidade: "1", 
        hh: String(team.hh), 
        total_hh: String(team.hh) 
      }];
    } else {
      newSelectedTeams = selectedTeams.filter((t) => t.id !== team.id);
    }
    onChange(updateTeamData(newSelectedTeams));
  }, [selectedTeams, onChange, availableTeams]);

  const handleCapacityChange = useCallback((teamId: string, capacityStr: string) => {
    const newSelectedTeams = selectedTeams.map(team =>
      team.id === teamId ? { ...team, capacidade: capacityStr } : team
    );
    onChange(updateTeamData(newSelectedTeams));
  }, [selectedTeams, onChange, availableTeams]);
  
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
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (availableTeams.length === 0 && !loading) {
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
      
      {selectedTeams.length > 0 && (
        <div>
          <Label className="text-base font-medium">Detalhes por Equipe</Label>
          <div className="mt-2 space-y-4">
            {updateTeamData(selectedTeams).map((displayTeam) => {
              const teamDetails = availableTeams.find(t => t.id === displayTeam.id);
              const maxCapacity = teamDetails?.capacidade || 1;
              
              return (
              <div key={displayTeam.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-2 border rounded-md">
                <Label className="font-semibold">{displayTeam.especialidade}</Label>
                <div className="space-y-1">
                    <Label htmlFor={`capacity-${displayTeam.id}`}>Capacidade</Label>
                    <Select
                        value={String(displayTeam.capacidade || 1)}
                        onValueChange={(val) => handleCapacityChange(displayTeam.id, val)}
                    >
                        <SelectTrigger id={`capacity-${displayTeam.id}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map(i => (
                                <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-1">
                    <Label htmlFor={`hh-${displayTeam.id}`}>HH</Label>
                    <Input id={`hh-${displayTeam.id}`} disabled value={displayTeam.hh || ''} />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor={`total-hh-${displayTeam.id}`}>HH/Dia</Label>
                    <Input id={`total-hh-${displayTeam.id}`} disabled value={displayTeam.total_hh || ''} />
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
