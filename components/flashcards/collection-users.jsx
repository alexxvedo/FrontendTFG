import { useWorkspaceSocket } from "@/components/workspace/workspace-socket-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";

export function CollectionUsers({ collectionId }) {
  const {
    usersInCollection,
    joinCollection,
    leaveCollection,
    isConnected,
    user,
  } = useWorkspaceSocket();
  const { data: session } = useSession();

  // Obtener los usuarios de la colección actual y filtrar duplicados
  const currentCollectionUsers = usersInCollection[collectionId] || [];

  // Filtrar usuarios duplicados y asegurarse de que el usuario actual solo aparezca si realmente está conectado
  const uniqueUsers = useMemo(() => {
    // Primero filtrar por email para eliminar duplicados
    const emailMap = new Map();

    currentCollectionUsers.forEach((collectionUser) => {
      // Solo mantener la entrada más reciente para cada email
      emailMap.set(collectionUser.email, collectionUser);
    });

    // Convertir el mapa a un array
    return Array.from(emailMap.values());
  }, [currentCollectionUsers]);

  // Unirse a la colección cuando el componente se monta
  useEffect(() => {
    if (isConnected && collectionId) {
      // Unirse a la colección para recibir actualizaciones en tiempo real
      joinCollection(collectionId);

      // Limpiar al desmontar
      return () => {
        leaveCollection(collectionId);
      };
    }
  }, [collectionId, isConnected, joinCollection, leaveCollection]);

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {uniqueUsers.length > 0 ? (
        <TooltipProvider delayDuration={300}>
          {uniqueUsers.map((user, index) => (
            <Tooltip key={`${user.email}-${index}`}>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-background w-8 h-8 transition-all hover:scale-110 hover:z-10">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-zinc-900/90 text-white border-zinc-800"
              >
                <p>{user.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      ) : (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 italic">
          No hay usuarios activos
        </div>
      )}
    </div>
  );
}
