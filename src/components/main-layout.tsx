
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutGrid, Hand } from "lucide-react";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/grupos") {
      return "Grupos de Ativos";
    }
    if (pathname === "/grupos/novo") {
      return "Criar Novo Grupo";
    }
    if (pathname.includes("/estrategias/nova")) {
       return "Criar Nova Estratégia";
    }
     if (pathname.includes("/estrategias") && pathname.includes("/editar")) {
       return "Editar Estratégia";
    }
    if (pathname.includes("/estrategias")) {
       return "Estratégias de Manutenção";
    }
    if (pathname === "/paradas") {
       return "Paradas de Manutenção";
    }
    if (pathname === "/paradas/criar") {
       return "Criar Nova Parada";
    }
    if (pathname.includes("/paradas") && pathname.includes("/editar")) {
       return "Editar Parada";
    }
    return "SmartPCM";
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-2">
          <div className="flex items-center justify-center p-2 h-[56px]">
             <h1 className="text-xl font-bold text-primary">SmartPCM</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/grupos")}
                tooltip="Exibir Grupos"
              >
                <Link href="/grupos">
                  <LayoutGrid />
                  <span>Grupos de Ativos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/paradas")}
                tooltip="Paradas de Manutenção"
              >
                <Link href="/paradas">
                  <Hand />
                  <span>Paradas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b shrink-0 bg-card shadow-sm w-full">
          <div className="flex items-center gap-3">
             <SidebarTrigger className="md:hidden" />
             <h1 className="text-lg font-semibold">
                {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Vale S.A.
              </p>
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </div>
  );
}
