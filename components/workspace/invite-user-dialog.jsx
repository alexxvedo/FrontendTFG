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
      }
    } catch (error) {
      console.error("Error generating token:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invitar Usuario</DialogTitle>
          <DialogDescription>
            Invita a un usuario a colaborar en este workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4"></div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="permission" className="text-right">
              Permisos
            </label>
            <Select value={permissionType} onValueChange={setPermissionType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona un nivel de permiso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">Visualizador</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="OWNER">Propietario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleGenerateToken}>
            Generar Link
          </Button>
          <Input
            type="text"
            value={`http://localhost:3000/invite/${token}`}
            readOnly
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => {}} disabled={isLoading}>
            {isLoading ? "Invitando..." : "Invitar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
