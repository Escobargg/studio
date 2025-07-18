"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

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

function DetailItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <p className="text-muted-foreground">{label}:</p>
      <p className="font-medium text-right truncate">{value}</p>
    </div>
  );
}

export function AssetGroupCard({ group }: AssetGroupCardProps) {
    const formattedDate = new Date(group.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return (
        <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="font-headline text-xl truncate">{group.nome_grupo}</CardTitle>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Criado em: {formattedDate}</span>
                    {group.tipo_grupo && <Badge variant={group.tipo_grupo === 'Frota' ? 'default' : 'secondary'}>{group.tipo_grupo}</Badge>}
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="py-4 space-y-3 flex-1">
                <DetailItem label="Diretoria Executiva" value={group.diretoria_executiva} />
                <DetailItem label="Diretoria" value={group.diretoria} />
                <DetailItem label="Unidade" value={group.unidade} />
                <DetailItem label="Centro de Localização" value={group.centro_de_localizacao} />
                <DetailItem label="Fase" value={group.fase} />
                <DetailItem label="Categoria" value={group.categoria} />
            </CardContent>
            
            {group.ativos && group.ativos.length > 0 && (
                <>
                    <Separator />
                    <CardFooter className="flex-col items-start p-4">
                        <h4 className="text-sm font-semibold mb-2">Ativos ({group.ativos.length})</h4>
                        <ScrollArea className="h-32 w-full rounded-md border p-2 bg-muted/50">
                            <div className="text-sm">
                                {group.ativos.map((ativo) => (
                                    <div key={ativo} className="truncate p-1">{ativo}</div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
