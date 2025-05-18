import { useState, useEffect } from "react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, UserPlus, Link, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function InviteUserDialog({
  isOpen,
  onClose,
  workspaceId,
  onInviteSuccess,
}) {
  const [permissionType, setPermissionType] = useState("VIEWER");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();

  // Reset token when dialog opens
  useEffect(() => {
    if (isOpen) {
      setToken("");
      setCopied(false);
    }
  }, [isOpen]);

  const handleGenerateToken = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          permissionType,
          inviterName: session?.user?.name || "Usuario",
          inviterEmail: session?.user?.email,
        }),
      });

      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        toast.success("Link de invitación generado");
      }
    } catch (error) {
      console.error("Error generating token:", error);
      toast.error("Error al generar el link de invitación");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(`http://localhost:3000/invite/${token}`);
      toast.success("Link copiado al portapapeles");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <UserPlus className="h-5 w-5 text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Invitar Usuario
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Invita a un usuario a colaborar en este workspace y establece sus permisos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-5 relative z-10">
          <div className="space-y-2">
            <label htmlFor="permission" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              Nivel de Permisos
            </label>
            <Select value={permissionType} onValueChange={setPermissionType}>
              <SelectTrigger className="w-full bg-zinc-800/80 border-zinc-700/50 focus:ring-purple-500/30 focus:border-purple-500/50 text-white">
                <SelectValue placeholder="Selecciona un nivel de permiso" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border border-zinc-700/50 text-white">
                <SelectItem value="VIEWER" className="hover:bg-zinc-700 focus:bg-zinc-700">
                  <div className="flex items-center">
                    <span className="mr-2">👁️</span> Visualizador - Solo puede ver
                  </div>
                </SelectItem>
                <SelectItem value="EDITOR" className="hover:bg-zinc-700 focus:bg-zinc-700">
                  <div className="flex items-center">
                    <span className="mr-2">✏️</span> Editor - Puede editar contenido
                  </div>
                </SelectItem>
                <SelectItem value="OWNER" className="hover:bg-zinc-700 focus:bg-zinc-700">
                  <div className="flex items-center">
                    <span className="mr-2">👑</span> Propietario - Control total
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Define qué acciones podrá realizar el usuario invitado en el workspace.
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button 
              onClick={handleGenerateToken}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 py-6"
            >
              <Link className="h-5 w-5" />
              {isLoading ? "Generando enlace..." : "Generar Link de Invitación"}
            </Button>
          </motion.div>
          
          <AnimatePresence>
            {token && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-300">
                  Link de invitación
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={`http://localhost:3000/invite/${token}`}
                    readOnly
                    className="pr-12 bg-zinc-800/80 border-zinc-700/50 text-white focus:ring-purple-500/30 focus:border-purple-500/50"
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className={`absolute right-0 top-0 h-full transition-all duration-300 ${copied ? 'text-green-400 bg-green-500/10' : 'text-purple-400 hover:bg-zinc-700'}`}
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Este enlace expirará en 24 horas. Compártelo solo con las personas que deseas invitar.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <DialogFooter className="gap-2 relative z-10">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-zinc-700/50 hover:bg-zinc-800 text-gray-300 hover:text-white transition-colors"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onClose} 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
