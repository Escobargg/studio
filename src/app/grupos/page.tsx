import { Building, List, MountainIcon, PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { AssetGroupCard, type AssetGroup } from '@/components/asset-group-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

async function getAssetGroups(): Promise<AssetGroup[]> {
  const { data, error } = await supabase
    .from('grupos_de_ativos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching asset groups:', error);
    return [];
  }
  return data || [];
}

export default async function GruposPage() {
  const groups = await getAssetGroups();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b shrink-0 bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <MountainIcon className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold font-headline">
            Registro de Grupos de Ativos
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                <PlusCircle className="w-4 h-4" />
                Criar Novo Grupo
            </Link>
            <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-muted-foreground"/>
                <p className="text-sm font-medium text-muted-foreground">Vale S.A.</p>
            </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Grupos Encontrados ({groups.length})</h2>
          {groups.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => (
                <AssetGroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[50vh]">
                <Alert className="max-w-md text-center">
                    <List className="h-4 w-4" />
                    <AlertTitle>Nenhum grupo encontrado</AlertTitle>
                    <AlertDescription>
                        Ainda não há grupos de ativos cadastrados. Comece criando um novo.
                    </AlertDescription>
                     <Button asChild className="mt-4">
                        <Link href="/">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar Novo Grupo
                        </Link>
                    </Button>
                </Alert>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
