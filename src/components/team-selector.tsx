
"use client";

import { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEquipes } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";

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
}

export function TeamSelector({ value: selectedTeams, onChange, duracaoHoras }: TeamSelectorProps) {
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      const teams = await getEquipes();
      setAvailableTeams(teams);
      setLoading(false);
    }
    fetchTeams();
  }, []);

  const handleTeamSelectionChange = (team: Team, checked: boolean) => {
    let newSelectedTeams: SelectedTeam[];
    if (checked) {
      // Add team with default capacity of 1
      newSelectedTeams = [...selectedTeams, { ...team, capacidade: 1 }];
    } else {
      // Remove team
      newSelectedTeams = selectedTeams.filter((t) => t.id !== team.id);
    }
    onChange(newSelectedTeams);
  };
  
  const handleCapacityChange = (teamId: string, capacityStr: string) => {
    const capacity = parseInt(capacityStr, 10) || 0;
    const newSelectedTeams = selectedTeams.map(team => 
      team.id === teamId ? { ...team, capacidade: capacity } : team
    );
    onChange(newSelectedTeams);
  };

  const calculatedTeams = useMemo(() => {
    return selectedTeams.map(team => {
      const availableTeam = availableTeams.find(at => at.id === team.id);
      if (!availableTeam) return team;

      const hh = availableTeam.hh || 0;
      const capacidade = team.capacidade || 0;
      const total_hh = capacidade * hh * (duracaoHoras / 24); // Assuming HH is per day

      return {
        ...team,
        hh,
        total_hh: Math.round(total_hh)
      };
    });
  }, [selectedTeams, availableTeams, duracaoHoras]);

  // Notify parent form about the calculated values
  useEffect(() => {
    onChange(calculatedTeams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(calculatedTeams)]); // Deep compare to avoid infinite loops

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

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium text-destructive">Equipes e Capacidade</Label>
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
              <div key={team.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
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
                    <Label htmlFor={`total-hh-${team.id}`}>HH/Dia</Label>
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

    