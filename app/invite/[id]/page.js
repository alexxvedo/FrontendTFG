"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { UserIcon, CheckIcon, ShieldIcon } from "lucide-react";

export default function InvitePage() {
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const api = useApi();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      const token = pathname.split("/").pop();
      try {
        const response = await fetch("/api/invite/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setInviteData(data.decoded);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [pathname]);

  const handleJoin = async () => {
    const token = pathname.split("/").pop();
    setIsLoading(true);
    try {
      const response = await api.workspaces.joinByInvite(
        inviteData.workspaceId,
        user.email,
        inviteData.permissionType
      );
      if (response.status === 200) {
        toast.success("Te has unido con éxito");
        router.push(`/workspaces`);
      } else {
        toast.error("Error al unirte al workspace");
      }
    } catch (error) {
      console.error("Error al unirte:", error);
      toast.error("Error al unirte al workspace");
    } finally {
      setIsLoading(false);
    }
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        damping: 15,
      },
    },
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0F]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full p-8 rounded-xl backdrop-blur-lg border border-gray-800 bg-gray-900/60"
        >
          <h1 className="text-2xl font-bold mb-4 text-red-400">Error</h1>
          <p className="text-gray-400">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0F]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 max-w-md w-full p-8 rounded-xl backdrop-blur-lg border border-gray-800 bg-gray-900/60 flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Verificando invitación...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0F]">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />

      {/* Animated orbs */}
      <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full p-8 rounded-xl backdrop-blur-lg border border-gray-800 bg-gray-900/60"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Invitación al Workspace
            </h1>
            {inviteData?.workspaceName && (
              <h2 className="text-xl font-semibold mb-6 text-center text-white">
                {inviteData.workspaceName}
              </h2>
            )}
          </motion.div>

          {inviteData && (
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Inviter information */}
              {inviteData.inviterName && (
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Invitado por</p>
                      <p className="text-white font-medium">
                        {inviteData.inviterName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Permission level */}
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <ShieldIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Nivel de acceso</p>
                    <p className="text-white font-medium">
                      {inviteData.permissionType === "VIEWER"
                        ? "Visualizador"
                        : inviteData.permissionType === "EDITOR"
                        ? "Editor"
                        : "Propietario"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <p className="text-gray-400 text-sm">
                  Al unirte, podrás colaborar con otros miembros del workspace
                  según tu nivel de permisos.
                </p>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative mt-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-70 transform -translate-y-1"></div>
            <Button
              onClick={handleJoin}
              disabled={isLoading}
              className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 py-6 text-lg font-medium rounded-lg shadow-md hover:shadow-lg border-0"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckIcon className="mr-2 h-5 w-5" />
                  Unirme al Workspace
                </span>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
