import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, Tag, Layers, ListChecks } from "lucide-react";

type Grupo = {
    id: string;
    nome_grupo: string;
    tipo_grupo: string;
    unidade: string;
    centro_de_localizacao: string;
    categoria: string;
    fase: string;
    ativos: string[];
};

interface AssetGroupCardProps {
  grupo: Grupo;
}

export function AssetGroupCard({ grupo }: AssetGroupCardProps) {
    return (
        <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300 border-border/60">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-bold">{grupo.nome_grupo}</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-1">
                           <Layers className="w-4 h-4" /> {grupo.tipo_grupo}
                        </CardDescription>
                    </div>
                    <Badge variant={grupo.fase ? 'default' : 'secondary'}>{grupo.fase || 'N/A'}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 flex-shrink-0" />
                        <span>Unidade: <span className="font-medium text-foreground">{grupo.unidade}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>Centro: <span className="font-medium text-foreground">{grupo.centro_de_localizacao}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tag className="w-4 h-4 flex-shrink-0" />
                        <span>Categoria: <span className="font-medium text-foreground">{grupo.categoria}</span></span>
                    </div>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                       <ListChecks className="w-4 h-4"/> Ativos ({grupo.ativos.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {grupo.ativos.slice(0, 3).map((ativo) => (
                            <Badge key={ativo} variant="secondary">{ativo}</Badge>
                        ))}
                        {grupo.ativos.length > 3 && (
                            <Badge variant="outline">+{grupo.ativos.length - 3} mais</Badge>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="outline">Ver Estratégias</Button>
            </CardFooter>
        </Card>
    );
}
