
"use client";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Grupo } from "@/components/asset-group-card";
import { StrategyCard, Strategy } from "@/components/strategy-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useParams } from "next/navigation";

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

async function getGroupStrategies(groupId: string): Promise<Strategy[]> {
    const { data, error } = await supabase
        .from("estrategias")
        .select("*")
        .eq("grupo_id", groupId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching strategies:", error);
        return [];
    }

    // Map Supabase data to Strategy type
    return data.map(s => ({
        id: s.id,
        title: s.nome,
        priority: s.prioridade,
        status: s.status as "ATIVA" | "INATIVA",
        description: s.descricao || '',
        frequency: `A cada ${s.frequencia_valor} ${s.frequencia_unidade.toLowerCase()}`,
        duration: `${s.duracao_valor} ${s.duracao_unidade.toLowerCase()}`,
        startDate: format(new Date(s.data_inicio), "dd/MM/yyyy", { locale: ptBR }),
        toleranceInDays: s.tolerancia_dias,
    }));
}


export default function EstrategiasPage() {
  const params = useParams();
  const groupId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      setLoading(true);
      const [groupDetails, groupStrategies] = await Promise.all([
        getGroupDetails(groupId),
        getGroupStrategies(groupId)
      ]);
      setGrupo(groupDetails);
      setStrategies(groupStrategies);
      setLoading(false);
    };

    fetchData();
  }, [groupId]);

  const handleStrategyUpdate = (updatedStrategy: Strategy) => {
    setStrategies(currentStrategies =>
      currentStrategies.map(s => (s.id === updatedStrategy.id ? updatedStrategy : s))
    );
  };

  const handleStrategyDelete = (deletedStrategyId: string) => {
    setStrategies(currentStrategies =>
      currentStrategies.filter(s => s.id !== deletedStrategyId)
    );
  };

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
      <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-muted/20 space-y-4">
        <Card>
           <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                         <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Estratégias - {grupo.nome_grupo}</CardTitle>
                        <CardDescription>
                            {grupo.unidade} | {grupo.centro_de_localizacao} | {grupo.fase} | {grupo.ativos.length} ativos
                        </CardDescription>
                    </div>
                </div>
                <Button asChild>
                  <Link href={`/grupos/${groupId}/estrategias/nova`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Estratégia
                  </Link>
                </Button>
            </CardHeader>
          </Card>

          {/* Strategies List */}
          <div className="space-y-4">
            {strategies.length > 0 ? (
                strategies.map((strategy) => (
                    <StrategyCard 
                        key={strategy.id}
                        groupId={groupId}
                        strategy={strategy} 
                        onStrategyUpdate={handleStrategyUpdate}
                        onStrategyDelete={handleStrategyDelete}
                    />
                ))
            ) : (
                <Card className="flex flex-col items-center justify-center py-12">
                     <CardContent className="text-center">
                        <h3 className="text-xl font-semibold">Nenhuma Estratégia Encontrada</h3>
                        <p className="text-muted-foreground mt-2">
                            Crie a primeira estratégia de manutenção para este grupo de ativos.
                        </p>
                    </CardContent>
                </Card>
            )}
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
    </MainLayout>
  );
}
