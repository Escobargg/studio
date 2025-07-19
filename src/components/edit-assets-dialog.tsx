
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAtivosByCentro } from "@/lib/data";
import { Edit, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

type Grupo = {
  id: string;
  nome_grupo: string;
  centro_de_localizacao: string;
  // `ativos` here is just for initial state, the source of truth is `grupo_ativos_relacao`
  ativos: string[]; 
};

interface EditAssetsDialogProps {
  grupo: Grupo;
  onUpdate: (updatedAssets: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUpdating: boolean;
}

export function EditAssetsDialog({ grupo, onUpdate, open, onOpenChange, isUpdating }: EditAssetsDialogProps) {
  const [allAssets, setAllAssets] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sincroniza o estado de ativos selecionados com as props quando o dialog abre
  useEffect(() => {
    if (open) {
      setIsLoading(true);

      const fetchCurrentAssets = async () => {
        const { data, error } = await supabase
          .from('grupo_ativos_relacao')
          .select('ativo')
          .eq('grupo_id', grupo.id);

        if (error) {
          toast.error("Falha ao carregar ativos do grupo.");
          console.error(error);
          return [];
        }
        return data.map(item => item.ativo);
      }

      const fetchAllAvailableAssets = async () => {
        return await getAtivosByCentro(grupo.centro_de_localizacao);
      }

      Promise.all([fetchCurrentAssets(), fetchAllAvailableAssets()])
        .then(([current, all]) => {
          setSelectedAssets(current);
          setAllAssets(all);
        })
        .catch(() => {
          toast.error("Falha ao carregar lista de ativos.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, grupo.id, grupo.centro_de_localizacao]);

  const handleCheckboxChange = (asset: string, checked: boolean) => {
    setSelectedAssets((prev) =>
      checked ? [...prev, asset] : prev.filter((a) => a !== asset)
    );
  };

  const handleSaveChanges = () => {
    onUpdate(selectedAssets);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
            <Edit className="w-4 h-4" />
            <span className="sr-only">Editar Ativos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Ativos</DialogTitle>
          <DialogDescription>
            Selecione ou desmarque os ativos para o grupo "{grupo.nome_grupo}".
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-72 my-4 border rounded-md p-4">
            <div className="space-y-2">
              {allAssets.map((asset) => (
                <div key={asset} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${asset}`}
                    checked={(selectedAssets || []).includes(asset)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(asset, !!checked)
                    }
                  />
                  <label
                    htmlFor={`edit-${asset}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {asset}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isUpdating}>Cancelar</Button>
          <Button onClick={handleSaveChanges} disabled={isLoading || isUpdating}>
            {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isUpdating ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
