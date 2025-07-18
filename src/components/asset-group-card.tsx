"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
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
        <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300 border-border/60">
            <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
                 {/* Main Info Section */}
                <div className="flex-grow flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto">
                    {/* Group Name and Type */}
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold truncate" title={grupo.nome_grupo}>{grupo.nome_grupo}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                            <Layers className="w-4 h-4" /> {grupo.tipo_grupo}
                        </p>
                    </div>

                    <Separator orientation="vertical" className="hidden md:block h-10" />
                    <Separator className="md:hidden" />

                    {/* Details Section */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 md:gap-6 text-sm w-full md:w-auto">
                        <div className="flex items-center gap-2 text-muted-foreground" title={grupo.unidade}>
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-xs">Unidade</span>
                                <span className="font-medium text-foreground truncate">{grupo.unidade}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground" title={grupo.centro_de_localizacao}>
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-xs">Centro</span>
                                <span className="font-medium text-foreground truncate">{grupo.centro_de_localizacao}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground" title={grupo.categoria}>
                            <Tag className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-xs">Categoria</span>
                                <span className="font-medium text-foreground truncate">{grupo.categoria}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ListChecks className="w-4 h-4 flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-xs">Ativos</span>
                                <span className="font-medium text-foreground">{grupo.ativos.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                 {/* Actions Section */}
                <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
                    <Badge variant={grupo.fase ? 'outline' : 'secondary'} className="h-8">{grupo.fase || 'N/A'}</Badge>
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
                </div>
            </div>
        </Card>
    );
}
