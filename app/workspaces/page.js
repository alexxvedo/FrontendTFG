"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useApi } from "@/lib/api";
import { useUserStore } from "@/store/user-store/user-store";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function WorkspacesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoading(true);
      setLoadingProgress(10);

      try {
        if (!isLoaded || !session?.user) {
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
          setError("No se pudieron cargar los espacios de trabajo. Por favor, inténtalo de nuevo.");
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
  }, [isLoaded, session]);

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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-pink-900/5 to-blue-900/3 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-blue-900/5 pointer-events-none" />

        {/* Floating orbs background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/5 dark:bg-pink-600/10 rounded-full blur-3xl animate-float-delayed" />
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
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="h-16 w-16 text-purple-500 dark:text-purple-400 animate-spin" />
          </motion.div>
          
          <motion.h2 
            className="mt-8 text-2xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Cargando Workspaces
          </motion.h2>
          
          <motion.div 
            className="mt-4 w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden"
            variants={itemVariants}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
          
          <motion.p 
            className="mt-4 text-gray-500 dark:text-gray-400 text-center max-w-md"
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-pink-900/5 to-blue-900/3 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-blue-900/5 pointer-events-none" />

        <motion.div 
          className="flex flex-col items-center justify-center h-screen p-4"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6"
            variants={itemVariants}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </motion.div>
          
          <motion.h2 
            className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center"
            variants={itemVariants}
          >
            No se pudieron cargar los workspaces
          </motion.h2>
          
          <motion.p 
            className="text-red-500 dark:text-red-400 text-center mb-6 max-w-md"
            variants={itemVariants}
          >
            {error}
          </motion.p>
          
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:opacity-90 transition-all"
            onClick={() => window.location.reload()}
            variants={itemVariants}
          >
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
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-pink-900/5 to-blue-900/3 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-blue-900/5 pointer-events-none" />

      {/* Floating orbs background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/5 dark:bg-pink-600/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 text-purple-500 dark:text-purple-400 animate-spin" />
      </div>
    </div>
  );
}
