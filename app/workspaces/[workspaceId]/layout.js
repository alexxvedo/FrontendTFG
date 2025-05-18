"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useApi, { setAuthToken } from "@/lib/api";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { WorkspaceSocketProvider } from "@/components/workspace/workspace-socket-provider";
import { Loader2 } from "lucide-react";
import WorkspaceNotFound from "@/components/workspace/WorkspaceNotFound";

export default function WorkspaceLayout({ children, params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [errorType, setErrorType] = useState(null);
  const api = useApi();
  
  // Usar React.use para desenvolver los parámetros
  const resolvedParams = React.use(params);
  const workspaceId = resolvedParams.workspaceId;

  // Configurar el token de autenticación cuando la sesión cambie
  useEffect(() => {
    if (session?.user?.email) {
      // Usar el email como token (simulado)
      setAuthToken(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    let isMounted = true;
    
    const checkAccess = async () => {
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      if (!session?.user?.email) {
        router.push("/login");
        return;
      }

      try {
        // Verificar acceso al workspace
        await api.workspaces.get(workspaceId);
        
        if (isMounted) {
          setHasAccess(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error al verificar acceso al workspace:", error);
        
        if (isMounted) {
          setLoading(false);
          
          // Determinar el tipo de error
          if (error.response) {
            if (error.response.status === 403) {
              setErrorType("noPermission");
            } else if (error.response.status === 404) {
              setErrorType("deleted");
            } else {
              setErrorType("notFound");
            }
          } else {
            setErrorType("notFound");
          }
        }
      }
    };

    if (status !== "loading") {
      checkAccess();
    }
    
    return () => {
      isMounted = false;
    };
  }, [workspaceId, router, status, session, api]);

  // Mostrar un indicador de carga mientras se verifica el acceso
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Cargando workspace...</p>
        </div>
      </div>
    );
  }
  
  // Si hay un error, mostrar el componente de error
  if (errorType) {
    return <WorkspaceNotFound errorType={errorType} />;
  }

  // Si tiene acceso, mostrar el contenido
  return hasAccess ? (
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
  ) : null;
}
