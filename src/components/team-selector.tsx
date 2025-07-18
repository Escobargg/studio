
"use client";

import { useState, useEffect } from "react";
import { Equipe as ApiEquipe } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export type SelectedTeam = {
  id: string;
  especialidade: string;
  capacidade: number;
};

interface TeamSelectorProps {
  availableTeams: ApiEquipe[];
  isLoading: boolean;
  selectedTeams: SelectedTeam[];
  onChange: (teams: SelectedTeam[]) => void;
}

export function TeamSelector({
  availableTeams,
  isLoading,
  selectedTeams,
  onChange,
}: TeamSelectorProps) {

  const handleTeamSelectionChange = (team: ApiEquipe, checked: boolean) => {
    if (checked) {
      onChange([...selectedTeams, { id: team.id, especialidade: team.especialidade, capacidade: 1 }]);
    } else {
      onChange(selectedTeams.filter((t) => t.id !== team.id));
    }
  };

  const handleCapacityChange = (teamId: string, capacidade: number) => {
    onChange(
      selectedTeams.map((t) =>
        t.id === teamId ? { ...t, capacidade: capacidade } : t
      )
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (availableTeams.length === 0) {
     return (
        <Card className="bg-muted/50">
            <CardContent className="p-4 text-center text-muted-foreground">
                <p>Nenhuma equipe encontrada para a combinação de Centro e Fase selecionada.</p>
                <p className="text-xs">Selecione um Centro e uma Fase para ver as equipes.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTeams.map((team) => {
                const isSelected = selectedTeams.some((t) => t.id === team.id);
                return (
                <div key={team.id} className="flex items-center space-x-2">
                    <Checkbox
                    id={team.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleTeamSelectionChange(team, !!checked)}
                    />
                    <Label htmlFor={team.id} className="flex-1 font-normal">{team.especialidade}</Label>
                </div>
                );
            })}
            </div>
        </CardContent>
      </Card>

      {selectedTeams.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2">Detalhes por Equipe</h4>
           <div className="space-y-3">
            {selectedTeams.map((team) => {
              const teamData = availableTeams.find(t => t.id === team.id);
              if (!teamData) return null;

              const maxCapacity = teamData.capacidade ?? 1;
              const teamHH = teamData.hh ?? 0;
              const totalHH = team.capacidade * teamHH;

              return (
              <div key={team.id} className="grid grid-cols-12 items-end gap-x-4 gap-y-2">
                <div className="col-span-12 sm:col-span-12 md:col-span-6 self-center">
                    <Label htmlFor={`capacity-${team.id}`}>{team.especialidade}</Label>
                </div>
                <div className="col-span-4 sm:col-span-4 md:col-span-2">
                  <Label htmlFor={`capacity-${team.id}`} className="text-xs text-muted-foreground">Capacidade</Label>
                  <Select
                    value={String(team.capacidade)}
                    onValueChange={(value) => handleCapacityChange(team.id, parseInt(value, 10))}
                  >
                    <SelectTrigger id={`capacity-${team.id}`}>
                      <SelectValue placeholder="Nº" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxCapacity }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-4 sm:col-span-4 md:col-span-2">
                  <Label htmlFor={`hh-${team.id}`} className="text-xs text-muted-foreground">HH</Label>
                  <Input
                    id={`hh-${team.id}`}
                    type="number"
                    value={teamHH}
                    disabled
                    placeholder="Auto"
                  />
                </div>
                 <div className="col-span-4 sm:col-span-4 md:col-span-2">
                  <Label htmlFor={`total-hh-${team.id}`} className="text-xs text-muted-foreground">HH/Dia</Label>
                  <Input
                    id={`total-hh-${team.id}`}
                    type="number"
                    value={totalHH}
                    disabled
                    placeholder="Auto"
                  />
                </div>
              </div>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
