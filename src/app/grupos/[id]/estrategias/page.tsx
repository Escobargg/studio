
"use client";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Grupo } from "@/components/asset-group-card";
import { StrategyCard, Strategy } from "@/components/strategy-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for strategies - replace with actual data fetching
const mockStrategies: Strategy[] = [
  {
    id: "1",
    title: "Manutenção Preventiva Quinzenal",
    priority: "MEDIUM",
    status: "ATIVA",
    description: "Manutenção preventiva dos transportadores de correia",
    frequency: "A cada 2 semana(s)",
    duration: "8 hora(s)",
    startDate: "14/01/2024",
  },
  {
    id: "2",
    title: "Parada Mensal Programada",
    priority: "HIGH",
    status: "INATIVA",
    description: "Parada completa para manutenção corretiva",
    frequency: "A cada 1 mês(es)",
    duration: "2 dia(s)",
    startDate: "31/01/2024",
  },
];


async function getGroupDetails(groupId: string): Promise<Grupo | null> {
  const { data, error } = await supabase
    .from("grupos_de_ativos")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error) {
    console.error("Error fetching group details:", error);
    return null;
  }
  return data;
}

export default function EstrategiasPage({ params }: { params: { id: string } }) {
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const groupDetails = await getGroupDetails(params.id);
      setGrupo(groupDetails);
      // TODO: Fetch real strategies for the group
      setStrategies(mockStrategies);
      setLoading(false);
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!grupo) {
    return (
      <MainLayout>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl text-muted-foreground">Grupo não encontrado.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6">
                <div>
                    <h1 className="text-2xl font-bold">Estratégias - {grupo.nome_grupo}</h1>
                    <p className="text-muted-foreground mt-1">
                        {grupo.unidade} | {grupo.centro_de_localizacao} | {grupo.ativos.length} ativos
                    </p>
                </div>
                <Button className="mt-4 md:mt-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Estratégia
                </Button>
            </div>
          </Card>

          {/* Strategies List */}
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))}
          </div>

          {/* Assets List */}
          <Card>
            <CardHeader>
                <CardTitle>Ativos do Grupo</CardTitle>
                <CardDescription>
                    Estratégias aplicam-se automaticamente a todos os ativos deste grupo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {grupo.ativos.map((ativo) => (
                        <div key={ativo} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                            <div>
                                <p className="font-semibold">{ativo}</p>
                                <p className="text-sm text-muted-foreground">{grupo.nome_grupo}</p>
                            </div>
                            <Badge variant="secondary">{grupo.tipo_grupo.toUpperCase()}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
