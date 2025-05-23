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
import { Trash, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/socket";
import { useParams } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useCollectionStore } from "@/store/collections-store/collection-store";

export default function DeleteCollectionDialog({ collection, onDelete }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { socket } = useSocket();
  const { data: session } = useSession();
  const params = useParams();
  const workspaceId = params?.workspaceId;
  
  // Acceder al estado global del sidebar para actualizarlo
  const updateActiveWorkspace = useSidebarStore(state => state.updateActiveWorkspace);
  const setWorkspaces = useSidebarStore(state => state.setWorkspaces);
  const workspaces = useSidebarStore(state => state.workspaces);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Llamar a la función de eliminación proporcionada por el padre
      await onDelete();
      
      // Notificar a través de WebSockets que la colección ha sido eliminada
      if (socket && collection?.id && workspaceId) {
        socket.emit("collection_deleted", {
          workspaceId,
          collectionId: collection.id,
          deletedBy: {
            id: session?.user?.id,
            email: session?.user?.email,
            name: session?.user?.name,
            image: session?.user?.image
          }
        });
      }
      
      // Actualizar SOLO el CollectionStore para eliminar la colección del sidebar
      // Sin tocar nada más
      const collectionStore = useCollectionStore.getState();
      const currentCollections = collectionStore.collections || [];
      collectionStore.setCollections(currentCollections.filter(c => c.id !== collection.id));
      
      setOpen(false);
    } catch (error) {
      console.error("Error al eliminar la colección:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20"
        >
          <Trash className="h-4 w-4" />
        </Button>
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
              Eliminar Colección
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Esta acción no se puede deshacer
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-5 relative z-10">
          <div className="space-y-2">
            <label
              htmlFor="collection-name"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              <Trash className="h-4 w-4 text-red-400" />
              Colección a eliminar
            </label>
            <div className="flex">
              <div
                id="collection-name"
                className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700/50 rounded-md text-white"
              >
                {collection.name}
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
              <p className="mb-2">Al eliminar esta colección:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Se eliminarán todos los datos asociados</li>
                <li>Los usuarios perderán acceso inmediatamente</li>
                <li>Esta acción es permanente y no se puede revertir</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500">
              Asegúrate de que realmente deseas eliminar esta colección antes de continuar.
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
              <span>Eliminar Colección</span>
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
