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
      setIsLoading(true);
      const response = await api.workspaces.getUsers(workspaceId);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 dark:border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200/10 dark:border-gray-700/20 bg-background/50 dark:bg-gray-800/10 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-purple-500/3 dark:bg-purple-500/5 border-b border-gray-200/10 dark:border-gray-700/20">
            <TableHead className="font-semibold text-foreground dark:text-white">
              Usuario
            </TableHead>
            <TableHead className="font-semibold text-foreground dark:text-white">
              Email
            </TableHead>
            <TableHead className="font-semibold text-foreground dark:text-white">
              Permisos
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground dark:text-white">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="hover:bg-purple-500/3 dark:hover:bg-purple-500/5 transition-colors border-b border-gray-200/10 dark:border-gray-700/20 last:border-0"
            >
              <TableCell className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 ring-1 ring-purple-500/20 dark:ring-pink-500/20">
                  <AvatarImage
                    src={user.image}
                    alt={user.name || "Usuario"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-foreground dark:text-white">
                  {user.name}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground dark:text-gray-300">
                {user.email}
              </TableCell>
              <TableCell className="text-muted-foreground dark:text-gray-300">
                {user.permissionType}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-purple-500/10 hover:text-foreground dark:hover:text-white"
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
