import { useWorkspaceSocket } from "@/components/workspace/workspace-socket-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CollectionUsers({ collectionId }) {
  const { usersInCollection } = useWorkspaceSocket();

  // Obtener los usuarios de la colección actual
  const currentCollectionUsers = usersInCollection[collectionId] || [];

  return (
    <div className="flex -space-x-2">
      {currentCollectionUsers.map((user, index) => (
        <Avatar
          key={user.id || index}
          className="border-2 border-background w-8 h-8"
        >
          <AvatarImage src={user.image} />
          <AvatarFallback>
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
