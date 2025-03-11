import { useState } from "react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
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
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function InviteUserDialog({
  isOpen,
  onClose,
  workspaceId,
  onInviteSuccess,
}) {
  const [permissionType, setPermissionType] = useState("VIEWER");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/95 border border-purple-500/20 backdrop-blur-sm shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Invitar Usuario
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Invita a un usuario a colaborar en este workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="permission" className="text-right text-gray-300">
              Permisos
            </label>
            <Select value={permissionType} onValueChange={setPermissionType}>
              <SelectTrigger className="col-span-3 bg-zinc-800 border-zinc-700 focus:ring-purple-500/30">
                <SelectValue placeholder="Selecciona un nivel de permiso" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="VIEWER" className="hover:bg-zinc-700 focus:bg-zinc-700">Visualizador</SelectItem>
                <SelectItem value="EDITOR" className="hover:bg-zinc-700 focus:bg-zinc-700">Editor</SelectItem>
                <SelectItem value="OWNER" className="hover:bg-zinc-700 focus:bg-zinc-700">Propietario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleGenerateToken}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading ? "Generando..." : "Generar Link"}
          </Button>
          
          {token && (
            <div className="relative">
              <Input
                type="text"
                value={`http://localhost:3000/invite/${token}`}
                readOnly
                className="pr-10 bg-zinc-800 border-zinc-700 text-white"
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 top-0 h-full hover:bg-zinc-700"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4 text-purple-400" />
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-zinc-700 hover:bg-zinc-800 text-gray-300"
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
