"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useApi, setAuthToken } from "@/lib/api";
import { useUserStore } from "@/store/user-store/user-store";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";

export default function WorkspacesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: session, status } = useSession();

  const setWorkspaces = useSidebarStore((state) => state.setWorkspaces);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );
  const api = useApi();
  const setUser = useUserStore((state) => state.setUser);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Configurar el token de autenticación cuando la sesión cambie
  useEffect(() => {
    if (session?.user?.email) {
      // Usar el email como token (simulado)
      setAuthToken(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (status === "loading" || !isLoaded) {
        return;
      }

      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      setIsLoading(true);
      setLoadingProgress(10);

      try {
        if (!session?.user) {
          setError("No se ha podido identificar al usuario. Por favor, inicia sesión de nuevo.");
          setIsLoading(false);
          return;
        }

        const user = session.user;
        setLoadingProgress(30);

        try {
          setLoadingProgress(50);
          const { data: workspaces } = await api.workspaces.listByUser(
            user?.email
          );
          setLoadingProgress(70);

          if (!workspaces || workspaces.length === 0) {
            setError("No tienes espacios de trabajo. Crea uno nuevo para comenzar.");
            setIsLoading(false);
            return;
          }

          setWorkspaces(workspaces);

          const firstWorkspace = workspaces[0];
          updateActiveWorkspace(firstWorkspace);
          setLoadingProgress(90);
          
          // Pequeño retraso para mostrar la animación completa
          setTimeout(() => {
            router.replace(`/workspaces/${firstWorkspace.id}/`);
          }, 300);
          
        } catch (workspaceError) {
          console.error(
            "Error al obtener espacios de trabajo:",
            workspaceError
          );
          
          // Mensaje de error más específico según el código de estado
          if (workspaceError.response) {
            if (workspaceError.response.status === 403) {
              setError("No tienes permisos para acceder a los espacios de trabajo. Verifica tu cuenta.");
            } else if (workspaceError.response.status === 401) {
              setError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
              setTimeout(() => router.push("/login"), 2000);
            } else {
              setError("No se pudieron cargar los espacios de trabajo. Por favor, inténtalo de nuevo.");
            }
          } else {
            setError("Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.");
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error general:", error);
        setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
      } finally {
        setLoadingProgress(100);
      }
    };

    fetchWorkspaces();
  }, [isLoaded, session, status, retryCount, router, setWorkspaces, updateActiveWorkspace]);

  // Función para reintentar la carga
  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Animaciones para los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground dark:bg-[#0A0A0F] dark:text-white">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />

        {/* Floating orbs background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-pink-900/10 rounded-full blur-3xl animate-float-slow" />
        </div>

        <motion.div 
          className="flex flex-col items-center justify-center h-screen"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
          </motion.div>
          
          <motion.h2 
            className="mt-6 text-2xl font-bold text-white"
            variants={itemVariants}
          >
            Cargando Workspaces
          </motion.h2>
          
          <motion.div 
            className="mt-4 w-64 h-2 bg-gray-800 rounded-full overflow-hidden"
            variants={itemVariants}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
          
          <motion.p 
            className="mt-4 text-gray-400 text-center max-w-md"
            variants={itemVariants}
          >
            Preparando tu espacio de trabajo colaborativo...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-background text-foreground dark:bg-[#0A0A0F] dark:text-white">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />

        <motion.div 
          className="flex flex-col items-center justify-center h-screen p-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6"
            variants={itemVariants}
          >
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-white mb-2 text-center"
            variants={itemVariants}
          >
            No se pudieron cargar los workspaces
          </motion.h2>
          
          <motion.p 
            className="text-red-400 text-center mb-6 max-w-md"
            variants={itemVariants}
          >
            {error}
          </motion.p>
          
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:opacity-90 transition-all flex items-center gap-2"
            onClick={handleRetry}
            variants={itemVariants}
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Estado de carga inicial
  return (
    <div className="relative min-h-screen bg-background text-foreground dark:bg-[#0A0A0F] dark:text-white">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />

      {/* Floating orbs background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-pink-900/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
      </div>
    </div>
  );
}
