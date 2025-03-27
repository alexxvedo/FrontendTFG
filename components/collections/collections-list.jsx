import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CreateCollectionDialog from "@/components/collections/CreateCollectionDialog";
import EditCollectionDialog from "@/components/collections/EditCollectionDialog";
import DeleteCollectionDialog from "@/components/collections/DeleteCollectionDialog";

import { Separator } from "@/components/ui/separator";

export function CollectionsList({
  collections,
  onCollectionCreate,
  onCollectionUpdate,
  onCollectionDelete,
  activeUsers,
  handleCollectionClick,
}) {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between min-h-full">
        <h2 className="text-3xl font-bold  bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
          Colecciones
        </h2>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:opacity-90 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Colección
        </Button>
      </div>
      <Separator />

      {collections && collections.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            return (
              <Card
                key={collection.id}
                className="relative overflow-hidden border-gray-200/10 dark:border-gray-700/20 bg-background/50 dark:bg-gray-800/20 backdrop-blur-sm cursor-pointer hover:bg-purple-500/5 dark:hover:bg-purple-500/10 transition-colors"
                onClick={() => handleCollectionClick(collection.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-gray-500/2 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/3 rounded-xl pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                    {collection.name}
                  </CardTitle>
                  <div
                    className="flex items-center space-x-2"
                    onClick={handleActionClick}
                  >
                    <EditCollectionDialog
                      collection={collection}
                      onUpdate={(data) =>
                        onCollectionUpdate(collection.id, data)
                      }
                    />
                    <DeleteCollectionDialog
                      collection={collection}
                      onDelete={() =>
                        onCollectionDelete(
                          collection.workspaceId,
                          collection.id
                        )
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-col space-y-4">
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      {collection.description || "Sin descripción"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground dark:text-gray-400">
                        Activos:
                      </span>

                      {activeUsers && activeUsers[collection.id] ? (
                        activeUsers[collection.id].map((user) => (
                          <AvatarGroup key={user.email}>
                            <Avatar
                              key={user.email}
                              className="border-2 border-background dark:border-gray-800 w-8 h-8 ring-1 ring-purple-500/20 dark:ring-pink-500/20"
                              title={`${user.name} (${user.email})`}
                            >
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </AvatarGroup>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground dark:text-gray-400">
                          No hay usuarios activos
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                      <span>Creada:</span>
                      <span>
                        {new Date(collection.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {!collections ||
        (collections.length === 0 && (
          <div className="flex min-h-full w-full items-center justify-center">
            <div className="text-lg text-muted-foreground dark:text-gray-400 self-center text-center">
              <span className="font-bold text-gradient">
                No collections found
              </span>
              <p className="text-gray-400">Try creating a new collection!</p>
            </div>
          </div>
        ))}

      <CreateCollectionDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={onCollectionCreate}
      />
    </div>
  );
}
