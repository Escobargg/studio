import { AssetRegistrationForm } from "@/components/asset-registration-form";
import { MainLayout } from "@/components/main-layout";
import { getHierarquiaOpcoes } from "@/lib/data";

export default async function Home() {
  const diretoriasExecutivas = await getHierarquiaOpcoes("diretoria_executiva");

  return (
    <MainLayout>
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <AssetRegistrationForm initialDiretoriasExecutivas={diretoriasExecutivas} />
        </div>
      </div>
    </MainLayout>
  );
}
