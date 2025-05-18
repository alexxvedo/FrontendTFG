import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, Info } from "lucide-react";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CreateCollectionDialog from "@/components/collections/CreateCollectionDialog";
import EditCollectionDialog from "@/components/collections/EditCollectionDialog";
import DeleteCollectionDialog from "@/components/collections/DeleteCollectionDialog";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Colecciones</h2>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:opacity-90 transition-all shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Colección
          </Button>
        </motion.div>
      </div>
      <Separator className="bg-gray-200/50 dark:bg-gray-700/50" />

      {collections && collections.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="relative overflow-hidden border border-gray-200/30 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all duration-300 group h-full"
                onClick={() => handleCollectionClick(collection.id)}
              >
                {/* Top gradient accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    collection.color === "gradient"
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                      : ""
                  }`}
                  style={
                    collection.color !== "gradient"
                      ? { backgroundColor: collection.color }
                      : {}
                  }
                />

                {/* Background glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-blue-500/5 dark:group-hover:from-purple-500/10 dark:group-hover:via-pink-500/10 dark:group-hover:to-blue-500/10 rounded-xl transition-all duration-300" />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1.5 max-w-[250px] overflow-hidden mb-1">
                      {collection.tags && collection.tags.length > 0 ? (
                        collection.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`${
                              collection.color === "gradient"
                                ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                : ""
                            } px-2.5 py-0.5 text-xs whitespace-nowrap`}
                            style={
                              collection.color !== "gradient"
                                ? {
                                    backgroundColor: `${collection.color}20`,
                                    borderColor: `${collection.color}40`,
                                    color: collection.color,
                                  }
                                : {}
                            }
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="outline"
                          className={`${
                            collection.color === "gradient"
                              ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : ""
                          } px-2.5 py-0.5 text-xs`}
                          style={
                            collection.color !== "gradient"
                              ? {
                                  backgroundColor: `${collection.color}20`,
                                  borderColor: `${collection.color}40`,
                                  color: collection.color,
                                }
                              : {}
                          }
                        >
                          Colección
                        </Badge>
                      )}
                      {collection.tags && collection.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 px-2.5 py-0.5 text-xs"
                        >
                          +{collection.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      {collection.name}
                    </CardTitle>
                  </div>
                  <div
                    className="flex items-center space-x-1"
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
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[40px]">
                      {collection.description || "Sin descripción"}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span>
                        {new Date(collection.createdAt).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Usuarios activos:
                      </span>

                      {activeUsers &&
                      activeUsers[collection.id] &&
                      activeUsers[collection.id].length > 0 ? (
                        <div className="flex items-center">
                          <AvatarGroup>
                            {activeUsers[collection.id].map((user) => (
                              <Avatar
                                key={user.email}
                                className="border-2 border-white dark:border-gray-800 w-7 h-7 ring-1 ring-purple-500/20 dark:ring-pink-500/20"
                                title={`${user.name} (${user.email})`}
                              >
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                  {user.name?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </AvatarGroup>
                          {activeUsers[collection.id].length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              +{activeUsers[collection.id].length - 3} más
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs italic text-gray-500 dark:text-gray-400 ml-1">
                          No hay usuarios activos
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* Bottom accent with subtle gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {!collections ||
        (collections.length === 0 && (
          <div className="flex min-h-[300px] w-full items-center justify-center bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <div className="text-center p-8">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center">
                <Info className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No hay colecciones
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                Crea una nueva colección para empezar a organizar tu contenido.
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:opacity-90 transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Colección
              </Button>
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
