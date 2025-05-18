"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash, AlertTriangle, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import useApi from "@/lib/api";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/socket";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useCollectionStore } from "@/store/collections-store/collection-store";

export default function DeleteWorkspaceDialog({ workspace, onDelete, trigger, userPermission }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  // Usando toast de sonner directamente
  const api = useApi();
  const { data: session } = useSession();
  const { socket } = useSocket();
  const router = useRouter();
  
  // Verificar si el usuario es propietario del workspace
  useEffect(() => {
    // Si se proporciona el permiso explícitamente, usarlo
    if (userPermission) {
      setIsOwner(userPermission === "OWNER");
      return;
    }
    
    // Si no, intentar obtener los usuarios del workspace para verificar
    const checkOwnership = async () => {
      try {
        if (!workspace?.id || !session?.user?.email) return;
        
        const response = await api.workspaces.getUsers(workspace.id);
        const users = response?.data || [];
        const currentUser = users.find(u => u.email === session.user.email);
        
        setIsOwner(currentUser?.permissionType === "OWNER");
      } catch (error) {
        console.error("Error al verificar permisos del workspace:", error);
        setIsOwner(false);
      }
    };
    
    checkOwnership();
  }, [workspace?.id, session?.user?.email, userPermission, api.workspaces]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Eliminar el workspace en el backend
      await api.workspaces.delete(workspace.id);
      
      // Notificar a través de WebSockets que el workspace ha sido eliminado
      if (socket) {
        socket.emit("workspace_deleted", {
          workspaceId: workspace.id,
          deletedBy: {
            id: session?.user?.id,
            email: session?.user?.email,
            name: session?.user?.name,
            image: session?.user?.image
          }
        });
      }
      
      toast.success(`El espacio de trabajo "${workspace.name}" ha sido eliminado correctamente.`);
      
      if (onDelete) {
        onDelete(workspace.id);
      }
      
      setOpen(false);
      
      // Redirigir al usuario a la página principal
      window.location.href = '/';
    } catch (error) {
      console.error("Error al eliminar el espacio de trabajo:", error);
      toast.error("No se pudo eliminar el espacio de trabajo. Inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Si el usuario no es propietario, no mostrar el botón de eliminar
  if (!isOwner) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20"
            title="Eliminar workspace (solo propietarios)"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0A0A0F]/95 border border-purple-500/20 backdrop-blur-sm shadow-lg overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />

        <DialogHeader className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Eliminar Espacio de Trabajo
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Esta acción no se puede deshacer
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-5 relative z-10">
          <div className="space-y-2">
            <label
              htmlFor="workspace-name"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              <Trash className="h-4 w-4 text-red-400" />
              Espacio de trabajo a eliminar
            </label>
            <div className="flex">
              <div
                id="workspace-name"
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700/50 rounded-md text-white"
              >
                {workspace.name}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="warning"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Advertencia
            </label>
            <div
              id="warning"
              className="min-h-[100px] p-4 bg-zinc-800/80 border-zinc-700/50 border-l-2 border-l-red-500 rounded-md text-gray-400"
            >
              <p className="mb-2">Al eliminar este espacio de trabajo:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Se eliminarán todas las colecciones asociadas</li>
                <li>Se eliminarán todos los documentos y flashcards</li>
                <li>Los usuarios perderán acceso inmediatamente</li>
                <li>Esta acción es permanente y no se puede revertir</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              Asegúrate de que realmente deseas eliminar este espacio de trabajo antes de continuar.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 py-6 relative group"
            >
              <span className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"></span>
              <Trash className="h-5 w-5 text-red-200" />
              <span>{isDeleting ? "Eliminando..." : "Eliminar Espacio de Trabajo"}</span>
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
