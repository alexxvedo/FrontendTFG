import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useApi } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function WorkspaceUsersList({ workspaceId, onUserRemoved }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  const fetchUsers = async () => {
    if (!workspaceId) return;
    
    try {
      console.log("👍 Fetching users for workspace:", workspaceId);
      setIsLoading(true);
      const response = await api.workspaces.getUsers(workspaceId);
      console.log("👍 Usuarios del workspace:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("No se pudieron cargar los usuarios del workspace.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [workspaceId]);

  const handleRemoveUser = async (userId) => {
    try {
      await api.workspaces.removeUser(workspaceId, userId);
      await fetchUsers();
      toast.success("Usuario eliminado correctamente");
      if (onUserRemoved) {
        onUserRemoved(userId);
      }
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error("No se pudo eliminar el usuario");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Permisos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user.image} 
                    alt={user.name || "Usuario"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback>
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.permissionType}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
