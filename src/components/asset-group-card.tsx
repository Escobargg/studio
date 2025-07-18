"use client";

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
import { Building, MapPin, Tag, Layers, ListChecks, Trash2 } from "lucide-react";
import { EditAssetsDialog } from "./edit-assets-dialog";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";


export type Grupo = {
    id: string;
    nome_grupo: string;
    tipo_grupo: string;
    unidade: string;
    centro_de_localizacao: string;
    categoria: string;
    fase: string;
    ativos: string[];
    created_at?: string; // Manter os outros campos
};

interface AssetGroupCardProps {
  grupo: Grupo;
  onGroupUpdate: (updatedGroup: Grupo) => void;
}

export function AssetGroupCard({ grupo, onGroupUpdate }: AssetGroupCardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (updatedAssets: string[]) => {
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('grupos_de_ativos')
                .update({ ativos: updatedAssets })
                .eq('id', grupo.id)
                .throwOnError();

            if (error) {
                throw error;
            }

            // Constrói o objeto atualizado localmente para evitar outra chamada ao banco
            const updatedGroup: Grupo = {
                ...grupo,
                ativos: updatedAssets,
            };
            
            toast.success("Grupo atualizado com sucesso!");
            onGroupUpdate(updatedGroup);
            setIsDialogOpen(false);

        } catch (error: any) {
            toast.error("Falha ao atualizar os ativos.");
            console.error("Erro ao atualizar grupo:", error.message || error);
        } finally {
            setIsUpdating(false);
        }
    };


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
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 <EditAssetsDialog 
                    grupo={grupo}
                    onUpdate={handleUpdate}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    isUpdating={isUpdating}
                 />
                 <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Excluir</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
