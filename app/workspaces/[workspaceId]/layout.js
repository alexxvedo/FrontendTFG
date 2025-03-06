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
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </SidebarProvider>
    </WorkspaceSocketProvider>
  );
}
