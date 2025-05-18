"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Background from "@/components/background/background";

export default function WorkspaceNotFound({ errorType = "deleted" }) {
  const router = useRouter();

  const errorMessages = {
    deleted: {
      title: "Espacio de trabajo eliminado",
      description: "Este espacio de trabajo ya no existe. Es posible que haya sido eliminado por el propietario.",
      icon: <AlertTriangle className="h-12 w-12 text-red-400" />
    },
    notFound: {
      title: "Espacio de trabajo no encontrado",
      description: "No pudimos encontrar el espacio de trabajo que estás buscando.",
      icon: <AlertTriangle className="h-12 w-12 text-yellow-400" />
    },
    noPermission: {
      title: "Acceso denegado",
      description: "No tienes permisos para acceder a este espacio de trabajo.",
      icon: <AlertTriangle className="h-12 w-12 text-orange-400" />
    }
  };

  const { title, description, icon } = errorMessages[errorType] || errorMessages.notFound;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Background />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl animate-float-delayed" />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full bg-[#0A0A0F]/80 backdrop-blur-lg rounded-lg border border-zinc-800 shadow-xl p-8"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-full bg-red-500/10">
            {icon}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-gray-400">
              {description}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            
            <Button
              onClick={() => router.push(`/`)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir al inicio
            </Button>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 mt-8 text-sm text-gray-500"
      >
        Si crees que esto es un error, contacta con el administrador del sistema.
      </motion.div>
    </div>
  );
}
