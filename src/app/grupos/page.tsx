import { AssetGroupCard } from "@/components/asset-group-card";
import { MainLayout } from "@/components/main-layout";
import { supabase } from "@/lib/supabase";
import { Building } from "lucide-react";

export const revalidate = 0; // Garante que os dados são sempre frescos

async function getGruposDeAtivos() {
  const { data, error } = await supabase
    .from("grupos_de_ativos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar grupos de ativos:", error);
    return [];
  }
  return data;
}

export default async function GruposPage() {
  const grupos = await getGruposDeAtivos();

  return (
    <MainLayout>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            {grupos.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {grupos.map((grupo) => (
                        <AssetGroupCard key={grupo.id} grupo={grupo} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <Building className="w-16 h-16 text-muted-foreground" />
                    <h2 className="mt-6 text-2xl font-semibold">Nenhum Grupo de Ativos Encontrado</h2>
                    <p className="mt-2 text-muted-foreground">Comece criando um novo grupo para vê-lo listado aqui.</p>
                </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
}
