import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactNode } from "react";
import { WorkspaceSocketProvider } from "@/components/workspace/workspace-socket-provider";

export default function WorkspaceLayout({ children }) {
  return (
    <WorkspaceSocketProvider>
      <SidebarProvider>
        <div className="flex w-full h-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto bg-background text-foreground dark:bg-[#0A0A0F] dark:text-white">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </WorkspaceSocketProvider>
  );
}
