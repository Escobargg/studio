"use client"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "./ui/button";
import { Building, MapPin } from "lucide-react";

export interface AssetGroup {
  id: string;
  created_at: string;
  nome_grupo: string;
  tipo_grupo: string | null;
  diretoria_executiva: string | null;
  diretoria: string | null;
  unidade: string | null;
  centro_de_localizacao: string | null;
  fase: string | null;
  categoria: string | null;
  ativos: string[] | null;
}

interface AssetGroupCardProps {
  group: AssetGroup;
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string | null | undefined, icon?: React.ElementType }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      <p><span className="text-muted-foreground">{label}:</span> <span className="font-medium">{value}</span></p>
    </div>
  );
}

export function AssetGroupCard({ group }: AssetGroupCardProps) {
    const ativosCount = group.ativos?.length || 0;

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 w-full">
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                <Building className="w-6 h-6 text-primary" />
                <div className="flex-1 flex items-center gap-3">
                  <h2 className="font-bold text-lg uppercase truncate">{group.nome_grupo}</h2>
                  {group.tipo_grupo && <Badge variant="outline" className="font-mono uppercase">{group.tipo_grupo}</Badge>}
                  {group.fase && <Badge variant="outline" className="font-mono uppercase">{group.fase}</Badge>}
                </div>
                <Button variant="outline" size="sm">Ver Estratégias</Button>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 border-t pt-4">
                    {/* Coluna da Esquerda */}
                    <div className="space-y-1.5">
                        <DetailItem label="Centro" value={group.centro_de_localizacao} icon={MapPin} />
                        <DetailItem label="Categoria" value={group.categoria} />
                        <p className="text-sm"><span className="text-muted-foreground">Estratégias Ativas:</span> <span className="font-medium">1 estratégias</span></p>
                        <DetailItem label="Diretoria" value={group.diretoria_executiva} />
                        <DetailItem label="Gerência" value={group.diretoria} />
                    </div>
                    {/* Coluna da Direita */}
                    <div className="space-y-1.5">
                         <DetailItem label="Sistema" value={group.tipo_grupo === 'Frota' ? 'Movimentação' : 'Britagem'} />
                         <p className="text-sm"><span className="text-muted-foreground">Ativos:</span> <span className="font-medium">{ativosCount} {ativosCount === 1 ? 'ativo' : 'ativos'}</span></p>
                    </div>
               </div>
            </CardContent>
        </Card>
    )
}
