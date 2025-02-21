"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useApi } from "@/lib/api";
import { useUserStore } from "@/store/user-store/user-store";

import { useSession } from "next-auth/react";

export default function WorkspacesPage() {
  const router = useRouter();

  const { data: session } = useSession();

  const setWorkspaces = useSidebarStore((state) => state.setWorkspaces);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );
  const api = useApi();
  const setUser = useUserStore((state) => state.setUser);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoading(true);

      try {
        if (!isLoaded || !session?.user) {
          console.log("Usuario no autenticado o sesión no cargada");
          setIsLoading(false);
          return;
        }

        const user = session.user;

        console.log("Usuario autenticado:", user, "id", user.email);

        try {
          const { data: workspaces } = await api.workspaces.listByUser(
            user?.email
          );

          setWorkspaces(workspaces);

          const firstWorkspace = workspaces[0];
          updateActiveWorkspace(firstWorkspace);
          router.replace(`/workspaces/${firstWorkspace.id}/dashboard`);
        } catch (workspaceError) {
          console.error(
            "Error al obtener espacios de trabajo:",
            workspaceError
          );
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error general:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [isLoaded, session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
