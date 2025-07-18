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
import { Building2, MountainIcon, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <MountainIcon className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">SmartPCM</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/"}
                tooltip="Criar Novo Grupo"
              >
                <Link href="/">
                  <PlusCircle />
                  <span>Criar Grupo</span>
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
                Criar Novo Grupo de Ativos
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
