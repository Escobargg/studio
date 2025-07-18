
"use client";

import { useState, useEffect, useCallback } from "react";
import { getEquipes, Equipe as ApiEquipe } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Label } from "./ui/label";

export type SelectedTeam = {
  id: string;
  especialidade: string;
  capacidade: number;
};

interface TeamSelectorProps {
  centroDeLocalizacao: string;
  fase: string;
  selectedTeams: SelectedTeam[];
  onChange: (teams: SelectedTeam[]) => void;
}

export function TeamSelector({
  centroDeLocalizacao,
  fase,
  selectedTeams,
  onChange,
}: TeamSelectorProps) {
  const [availableTeams, setAvailableTeams] = useState<ApiEquipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchTeams() {
      if (centroDeLocalizacao && fase) {
        setIsLoading(true);
        const teams = await getEquipes(centroDeLocalizacao, fase);
        setAvailableTeams(teams);
        setIsLoading(false);
      } else {
        setAvailableTeams([]);
      }
    }
    fetchTeams();
  }, [centroDeLocalizacao, fase]);

  const handleTeamSelectionChange = (team: ApiEquipe, checked: boolean) => {
    if (checked) {
      // Add team to selected list
      onChange([...selectedTeams, { id: team.id, especialidade: team.especialidade, capacidade: 1 }]);
    } else {
      // Remove team from selected list
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

  if (!centroDeLocalizacao || !fase) {
    return (
        <Card className="bg-muted/50">
            <CardContent className="p-4 text-center text-muted-foreground">
                <p>Selecione um Centro de Localização e uma Fase para ver as equipes disponíveis.</p>
            </CardContent>
        </Card>
    )
  }
  
  if (availableTeams.length === 0) {
     return (
        <Card className="bg-muted/50">
            <CardContent className="p-4 text-center text-muted-foreground">
                <p>Nenhuma equipe encontrada para a combinação de Centro e Fase selecionada.</p>
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
          <h4 className="text-md font-medium mb-2">Capacidade por Equipe</h4>
           <div className="space-y-3">
            {selectedTeams.map((team) => (
              <div key={team.id} className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={`capacity-${team.id}`} className="col-span-1">{team.especialidade}</Label>
                <Input
                  id={`capacity-${team.id}`}
                  type="number"
                  min="1"
                  value={team.capacidade}
                  onChange={(e) => handleCapacityChange(team.id, parseInt(e.target.value, 10) || 0)}
                  className="col-span-2"
                  placeholder="Nº de pessoas"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
