"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

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
      const response = await api.workspaces.join(
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-sm bg-white/80 border border-red-100"
        >
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-700">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-sm bg-white/80 border border-gray-100 flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700">Verificando invitación...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full backdrop-blur-sm bg-white/80 border border-gray-100"
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Invitación al Workspace
          </h1>
          {inviteData?.workspaceName && (
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
              {inviteData.workspaceName}
            </h2>
          )}
        </motion.div>
        
        {inviteData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 space-y-4"
          >
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Has sido invitado a unirte a este workspace
              </p>
              <div className="flex items-center justify-center mb-6">
                <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 inline-flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <p className="text-gray-700 font-medium">
                    Nivel de acceso:{" "}
                    <span className="text-blue-600 font-semibold ml-1">
                      {inviteData.permissionType === "VIEWER" 
                        ? "Visualizador" 
                        : inviteData.permissionType === "EDITOR" 
                          ? "Editor" 
                          : "Propietario"}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <p className="text-sm text-gray-600 italic">
                  Al unirte, podrás colaborar con otros miembros del workspace según tu nivel de permisos.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-sm opacity-70 transform -translate-y-1"></div>
          <Button
            onClick={handleJoin}
            disabled={isLoading}
            className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 py-6 text-lg font-medium rounded-xl shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Procesando...
              </span>
            ) : (
              "Unirme al Workspace"
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
