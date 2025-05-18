"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const permission = searchParams.get("permission");
  const [countdown, setCountdown] = useState(5);

  // Determinar el mensaje según el permiso requerido
  const getErrorMessage = () => {
    switch (permission) {
      case "EDIT":
        return "No tienes permisos de edición en este workspace. Necesitas ser EDITOR o OWNER para realizar esta acción.";
      case "OWNER":
        return "Solo el propietario del workspace puede realizar esta acción.";
      default:
        return "No tienes permisos para acceder a este recurso. Verifica que tienes los permisos necesarios o contacta con el propietario del workspace.";
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Mover la redirección aquí dentro del useEffect
          setTimeout(() => {
            router.push("/workspaces");
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-pink-900/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0A0A0F]/80 backdrop-blur-lg border border-gray-800 rounded-xl p-8 shadow-xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <ShieldAlert className="h-10 w-10 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Acceso Denegado
            </h1>

            <p className="text-gray-400 mb-6">{getErrorMessage()}</p>

            <p className="text-sm text-gray-500 mb-6">
              Serás redirigido a la página principal en{" "}
              <span className="text-white font-medium">{countdown}</span>{" "}
              segundos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 hover:text-white transition-all"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>

              <Button
                onClick={() => router.push("/")}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all"
              >
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
