
"use client";

import { AssetRegistrationForm } from "@/components/asset-registration-form";
import { MainLayout } from "@/components/main-layout";
import { getHierarquiaOpcoes } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function NovoGrupoPage() {
  const [diretoriasExecutivas, setDiretoriasExecutivas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      const data = await getHierarquiaOpcoes("diretoria_executiva");
      setDiretoriasExecutivas(data);
      setLoading(false);
    }
    fetchInitialData();
  }, []);

  return (
    <MainLayout>
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
           <AssetRegistrationForm initialDiretoriasExecutivas={diretoriasExecutivas} isLoadingInitial={loading} />
        </div>
      </div>
    </MainLayout>
  );
}
