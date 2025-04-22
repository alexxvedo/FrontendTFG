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
import { Trash2, Shield, Mail, User, CheckCircle, Clock } from "lucide-react";
import { useApi } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export function WorkspaceUsersList({ workspaceId, onUserRemoved }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
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

  // Función para generar el badge de permisos con el estilo adecuado
  const getPermissionBadge = (permissionType) => {
    switch (permissionType) {
      case "OWNER":
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
            <Shield className="h-3 w-3 mr-1" />
            Propietario
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Shield className="h-3 w-3 mr-1" />
            Administrador
          </Badge>
        );
      case "EDITOR":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            <CheckCircle className="h-3 w-3 mr-1" />
            Editor
          </Badge>
        );
      case "VIEWER":
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0">
            <Clock className="h-3 w-3 mr-1" />
            Visualizador
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {permissionType}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-purple-500 dark:border-pink-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-purple-300 dark:border-pink-300 animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="p-4 bg-purple-100/50 dark:bg-purple-900/20 rounded-full">
          <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="font-medium text-foreground dark:text-white">No hay usuarios</h3>
        <p className="text-muted-foreground dark:text-gray-400 text-sm max-w-md">
          Este workspace no tiene usuarios asignados. Invita a otros usuarios para colaborar.
        </p>
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
              className="group hover:bg-purple-500/3 dark:hover:bg-purple-500/5 transition-colors border-b border-gray-200/10 dark:border-gray-700/20 last:border-0"
            >
              <TableCell className="py-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 ring-2 ring-background/80 dark:ring-gray-900/80 border border-gray-200/20 dark:border-gray-700/30 shadow-sm group-hover:shadow-md transition-all">
                    <AvatarImage
                      src={user.image}
                      alt={user.name || "Usuario"}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      {user.name || "Usuario sin nombre"}
                    </span>
                    {session?.user?.email === user.email && (
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Tú
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground dark:text-gray-300 py-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground dark:text-gray-400" />
                  <span className="truncate max-w-[200px]">{user.email}</span>
                </div>
              </TableCell>
              <TableCell className="py-3">
                {getPermissionBadge(user.permissionType)}
              </TableCell>
              <TableCell className="text-right py-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-red-100/80 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        onClick={() => handleRemoveUser(user.id)}
                        disabled={session?.user?.email === user.email}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p className="text-xs">Eliminar usuario</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
