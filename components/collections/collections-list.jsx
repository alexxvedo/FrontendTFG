import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CreateCollectionDialog from "@/components/collections/CreateCollectionDialog";
import EditCollectionDialog from "@/components/collections/EditCollectionDialog";
import DeleteCollectionDialog from "@/components/collections/DeleteCollectionDialog";

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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Colecciones</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Colección
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          return (
            <Card
              key={collection.id}
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleCollectionClick(collection.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">
                  {collection.name}
                </CardTitle>
                <div
                  className="flex items-center space-x-2"
                  onClick={handleActionClick}
                >
                  <EditCollectionDialog
                    collection={collection}
                    onUpdate={(data) => onCollectionUpdate(collection.id, data)}
                  />
                  <DeleteCollectionDialog
                    collection={collection}
                    onDelete={() =>
                      onCollectionDelete(collection.workspaceId, collection.id)
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {collection.description || "Sin descripción"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Activos:
                    </span>
                    <AvatarGroup>
                      {activeUsers &&
                        activeUsers[collection.id] &&
                        activeUsers[collection.id].map((user) => (
                          <Avatar
                            key={user.email}
                            className="border-2 border-background w-8 h-8"
                            title={`${user.name} (${user.email})`}
                          >
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>
                              {user.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                    </AvatarGroup>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Creada:</span>
                    <span>
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={onCollectionCreate}
      />
    </div>
  );
}
