import { getHierarquiaOpcoes } from "@/lib/data";
import { AssetRegistrationForm } from "@/components/asset-registration-form";
import { Building2, MountainIcon } from "lucide-react";

export default async function Home() {
  // Fetch initial data only for the first dropdown in the cascade
  const diretoriasExecutivas = await getHierarquiaOpcoes("diretoria_executiva");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b shrink-0 bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <MountainIcon className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold font-headline">
            Registro de Grupos de Ativos
          </h1>
        </div>
        <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground"/>
            <p className="text-sm font-medium text-muted-foreground">Vale S.A.</p>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <AssetRegistrationForm initialDiretoriasExecutivas={diretoriasExecutivas} />
        </div>
      </main>
    </div>
  );
}
