"use client";

import { useEffect, useState, useCallback } from "react";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Plus,
  ArrowLeft,
  Play,
  Zap,
  Book,
  Folder,
  StickyNote,
  ShieldAlert,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/context/socket";
import { useWorkspaceSocket } from "@/components/workspace/workspace-socket-provider";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import AIGenerator from "@/components/flashcards/AIGenerator";
import FlashcardEditor from "@/components/flashcards/FlashcardEditor";
import Link from "next/link";
import SpacedStudyMode from "@/components/flashcards/SpacedStudyMode";

import StudyDialog from "@/components/collection/StudyDialog";
import Background from "@/components/background/background";

import { Separator } from "@/components/ui/separator";

import PetAgent from "@/components/agent/PetAgent";
import CollectionStats from "@/components/collection/CollectionStats";
import CollectionResources from "@/components/collection/CollectionResources";
import CollectionNotes from "@/components/collection/CollectionNotes";
import FlashcardTabs from "@/components/collection/FlashcardTabs";
import CollectionNotFound from "@/components/collection/CollectionNotFound";

export default function CollectionPage() {
  const { workspaceId, collectionId } = useParams();
  const { setActiveCollection } = useCollectionStore();
  const router = useRouter();

  const api = useApi();

  const { socket: baseSocket } = useSocket();
  const {
    socket,
    joinCollection,
    leaveCollection,
    isConnected,
    usersInCollection,
  } = useWorkspaceSocket();

  const { data: session } = useSession();
  const user = session?.user;

  const [collection, setCollection] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("flashcards");
  const [openEditor, setOpenEditor] = useState(false);
  const [isSpacedStudyOpen, setIsSpacedStudyOpen] = useState(false);
  const [isStudyDialogOpen, setIsStudyDialogOpen] = useState(false);
  const [studyMode, setStudyMode] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [userPermission, setUserPermission] = useState(null);
  const [collectionResources, setCollectionResources] = useState([]);
  const [errorType, setErrorType] = useState(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const loadCollection = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.collections.get(
        parseInt(workspaceId),
        parseInt(collectionId),
        user?.email
      );
      setCollection(response.data);
      setActiveCollection(response.data);

      // También cargar el workspace
      const workspaceResponse = await api.workspaces.get(parseInt(workspaceId));
      setWorkspace(workspaceResponse.data);
      setErrorType(null); // Limpiar cualquier error previo

      // Imprimir la estructura completa del workspace para depuración
      console.log(
        "Estructura completa del workspace:",
        JSON.stringify(workspaceResponse.data, null, 2)
      );

      // Determinar el permiso del usuario actual
      if (user && workspaceResponse.data) {
        console.log("Usuario actual:", user);

        // Verificar si el workspace tiene la propiedad users
        if (
          workspaceResponse.data.users &&
          Array.isArray(workspaceResponse.data.users)
        ) {
          console.log("Usuarios del workspace:", workspaceResponse.data.users);

          // Buscar el usuario actual en la lista de usuarios del workspace
          // Probamos diferentes propiedades para encontrar el email
          const currentUser = workspaceResponse.data.users.find((u) => {
            // Comprobamos todas las posibles propiedades que podrían contener el email
            const userEmail = user.email.toLowerCase();
            const matchEmail = u.email && u.email.toLowerCase() === userEmail;
            const matchUserEmail =
              u.userEmail && u.userEmail.toLowerCase() === userEmail;

            console.log(`Comparando usuario del workspace:`, u);
            console.log(
              `Match email: ${matchEmail}, Match userEmail: ${matchUserEmail}`
            );

            return matchEmail || matchUserEmail;
          });

          console.log("Usuario encontrado en workspace:", currentUser);

          // Si se encuentra el usuario, obtener su tipo de permiso, de lo contrario establecer como NONE
          const currentUserPermission = currentUser?.permissionType || "NONE";

          console.log("Permiso del usuario:", currentUserPermission);
          setUserPermission(currentUserPermission);
        } else {
          console.log(
            "El workspace no tiene la propiedad users o no es un array:",
            workspaceResponse.data
          );

          // Intentar cargar los usuarios del workspace directamente
          try {
            const usersResponse = await api.workspaces.getUsers(
              parseInt(workspaceId)
            );
            console.log("Usuarios obtenidos directamente:", usersResponse.data);

            if (usersResponse.data && Array.isArray(usersResponse.data)) {
              const currentUser = usersResponse.data.find((u) => {
                const userEmail = user.email.toLowerCase();
                const matchEmail =
                  u.email && u.email.toLowerCase() === userEmail;
                const matchUserEmail =
                  u.userEmail && u.userEmail.toLowerCase() === userEmail;

                return matchEmail || matchUserEmail;
              });

              console.log(
                "Usuario encontrado en la llamada directa:",
                currentUser
              );

              // Si se encuentra el usuario, obtener su tipo de permiso
              const currentUserPermission =
                currentUser?.permissionType || "NONE";

              console.log(
                "Permiso del usuario (de llamada directa):",
                currentUserPermission
              );
              setUserPermission(currentUserPermission);
            }
          } catch (error) {
            console.error("Error al obtener usuarios directamente:", error);
          }
        }
      } else {
        // Si no hay información de usuario o de usuarios del workspace, establecer como NONE
        console.log(
          "No se pudo determinar el permiso, estableciendo como NONE por defecto"
        );
        setUserPermission("NONE");
      }

      // Cargar las flashcards
      const flashcardsResponse = await api.flashcards.listByCollection(
        parseInt(workspaceId),
        parseInt(collectionId),
        user.email
      );

      // Cargar los documentos (recursos)
      const resourcesResponse = await api.resources.list(
        parseInt(workspaceId),
        parseInt(collectionId)
      );

      setCollection((prev) => ({
        ...prev,
        ...response.data,
        flashcards: flashcardsResponse.data,
        resources: resourcesResponse.data || [],
      }));

      console.log("Colección cargada:", response.data);
      console.log("Recursos cargados:", resourcesResponse.data);

      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar la colección:", error);
      setIsLoading(false);

      // Determinar el tipo de error
      if (error.response) {
        if (error.response.status === 403) {
          setErrorType("noPermission");
        } else if (error.response.status === 404) {
          setErrorType("deleted");
        } else {
          setErrorType("notFound");
        }
      } else {
        setErrorType("notFound");
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, collectionId, api, setActiveCollection, user]);

  useEffect(() => {
    if (collection) {
      setIsLoading(false);
      // Inicializar los recursos de la colección
      if (collection.resources && collection.resources.length > 0) {
        setCollectionResources(collection.resources);
      }
    }
  }, [collection]);

  useEffect(() => {
    if (collectionId && workspaceId && isHydrated) {
      loadCollection();
    }
  }, [collectionId, workspaceId, isHydrated]);

  useEffect(() => {
    if (!user || !collection?.id || !isConnected) return;

    // Unirse a la colección cuando se carga
    joinCollection(collection.id, {
      userId: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    });

    // Cleanup: dejar la colección cuando se desmonta el componente
    return () => {
      if (collection?.id) {
        leaveCollection(collection.id, {
          userId: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });
      }
    };
  }, [collection?.id, isConnected, user, joinCollection, leaveCollection]);

  // Actualizar la lista de usuarios activos cuando cambia usersInCollection
  useEffect(() => {
    if (collection?.id && usersInCollection[collection.id]) {
      setActiveUsers(Object.values(usersInCollection[collection.id]));
    }
  }, [collection?.id, usersInCollection]);

  // Escuchar eventos de socket
  useEffect(() => {
    if (!socket || !collection?.id) return;

    // Manejar actualización de usuarios en la colección
    const handleCollectionUsersUpdate = (data) => {
      if (data.collectionId === collection.id) {
        setActiveUsers(Object.values(data.users));
      }
    };

    // Manejar cuando un usuario se une a la colección
    const handleUserJoinCollection = (data) => {
      if (
        data.collectionId === collection.id &&
        data.user.email !== user?.email
      ) {
        toast.success(`${data.user.name} se ha unido a la colección`);
      }
    };

    // Manejar cuando un usuario deja la colección
    const handleUserLeaveCollection = (data) => {
      if (
        data.collectionId === collection.id &&
        data.user.email !== user?.email
      ) {
        toast.info(`${data.user.name} ha dejado la colección`);
      }
    };

    // Manejar cuando una colección es eliminada
    const handleCollectionDeleted = (data) => {
      console.log("Evento collection_deleted recibido:", data);
      if (data.collectionId === collection.id) {
        console.log("La colección actual ha sido eliminada");
        toast.error(
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Colección eliminada</div>
            <div className="text-sm">
              La colección ha sido eliminada por{" "}
              {data.deletedBy?.name || "un administrador"}.
            </div>
          </div>,
          { duration: 5000 }
        );

        // Establecer el tipo de error para mostrar la pantalla de colección eliminada
        setErrorType("deleted");

        // Redirigir al workspace después de un breve retraso
        setTimeout(() => {
          window.location.href = `/workspaces/${workspaceId}`;
        }, 1500);
      }
    };

    // Suscribirse a eventos
    socket.on("collection_users_updated", handleCollectionUsersUpdate);
    socket.on("user_join_collection", handleUserJoinCollection);
    socket.on("user_leave_collection", handleUserLeaveCollection);
    socket.on("collection_deleted", handleCollectionDeleted);

    // Limpiar suscripciones
    return () => {
      socket.off("collection_users_updated", handleCollectionUsersUpdate);
      socket.off("user_join_collection", handleUserJoinCollection);
      socket.off("user_leave_collection", handleUserLeaveCollection);
      socket.off("collection_deleted", handleCollectionDeleted);
    };
  }, [socket, collection?.id, user?.email, workspaceId]);

  // Verificar si el usuario tiene permisos de edición
  // Un usuario con rol OWNER o EDITOR en el workspace puede editar cualquier colección
  const canEdit = ["EDITOR", "OWNER"].includes(userPermission);

  // Función para cargar flashcards de una colección
  const fetchFlashcardsData = async (collectionId) => {
    try {
      const flashcardsResponse = await api.flashcards.listByCollection(
        parseInt(workspaceId),
        parseInt(collectionId),
        user.email
      );
      setCollection((prev) => ({
        ...prev,
        flashcards: flashcardsResponse.data,
      }));
    } catch (error) {
      console.error("Error al cargar flashcards:", error);
    }
  };

  // Manejar cuando se añade una nueva flashcard
  const handleFlashcardAdded = () => {
    if (collection?.id) {
      fetchFlashcardsData(collection.id);
    }
  };

  // Manejar cuando se guarda una nota
  const handleNoteSaved = () => {
    // Actualizar la vista de notas si es necesario
    if (activeTab === "notes") {
      // Aquí podríamos recargar las notas si fuera necesario
      console.log("Nota guardada, actualizando vista si es necesario");
    }
  };

  const handleResourceUploaded = async () => {
    // Cargar los documentos (recursos)
    const resourcesResponse = await api.resources.list(
      parseInt(workspaceId),
      parseInt(collectionId)
    );

    console.log("Resources");

    setCollection((prev) => ({
      ...prev,
      resources: resourcesResponse.data || [],
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-[#0A0A0F] text-foreground dark:text-white">
      <Background />

      <div className="container mx-auto px-4 py-8 z-10 relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Link
              href={`/workspaces/${workspaceId}`}
              className="flex items-center text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="text-sm">Volver</span>
            </Link>
            <h1 className="text-3xl font-bold">{collection?.name}</h1>
            {!canEdit && (
              <div className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Solo lectura
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2 mr-4">
              {activeUsers.slice(0, 5).map((user, index) => (
                <Avatar
                  key={user.email || index}
                  className="border-2 border-background dark:border-[#0A0A0F] h-8 w-8"
                >
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              ))}
              {activeUsers.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center text-xs border-2 border-background dark:border-[#0A0A0F]">
                  +{activeUsers.length - 5}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setStudyMode("normal");
                  setIsStudyDialogOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-primary dark:bg-blue-600 text-primary-foreground dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700 transition-colors"
              >
                <Play className="h-4 w-4 mr-2" />
                Estudiar
              </button>
              <button
                onClick={() => {
                  setStudyMode("spaced");
                  setIsStudyDialogOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <Zap className="h-4 w-4 mr-2" />
                Repaso espaciado
              </button>

              {/* Separador vertical */}
              <div className="h-8 border-l border-gray-300/20 dark:border-gray-700/30 mx-2"></div>

              {canEdit && (
                <button
                  onClick={() => setOpenEditor(true)}
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-400 hover:bg-primary/20 dark:hover:bg-blue-500/30 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir flashcard
                </button>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-4 bg-gray-200/10" />

        <div className="flex flex-col space-y-4">
          <div className="flex border-b border-gray-200/10 dark:border-gray-800/50">
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "flashcards"
                  ? "border-b-2 border-purple-500 text-foreground dark:text-white"
                  : "text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-300"
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "stats"
                  ? "border-b-2 border-purple-500 text-foreground dark:text-white"
                  : "text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-300"
              }`}
            >
              <Book className="h-4 w-4 mr-2" />
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "resources"
                  ? "border-b-2 border-purple-500 text-foreground dark:text-white"
                  : "text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-300"
              }`}
            >
              <Folder className="h-4 w-4 mr-2" />
              Recursos
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "notes"
                  ? "border-b-2 border-purple-500 text-foreground dark:text-white"
                  : "text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-gray-300"
              }`}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Notas
            </button>
          </div>
        </div>

        <div className="mt-2">
          {activeTab === "flashcards" && (
            <FlashcardTabs
              collection={collection}
              isLoading={isLoading}
              canEdit={canEdit}
            />
          )}
          {activeTab === "stats" && <CollectionStats collection={collection} />}
          {activeTab === "resources" && (
            <CollectionResources
              collection={collection}
              canEdit={canEdit}
              onResourceUploaded={handleResourceUploaded}
            />
          )}
          {activeTab === "notes" && <CollectionNotes canEdit={canEdit} />}
        </div>
      </div>

      {canEdit && (
        <FlashcardEditor
          open={openEditor}
          onOpenChange={setOpenEditor}
          collection={collection}
          onFlashcardAdded={handleFlashcardAdded}
        />
      )}

      <Dialog
        open={isAIDialogOpen}
        onOpenChange={(open) => {
          setIsAIDialogOpen(open);
          // Cuando se cierra el diálogo, recargamos toda la colección
          if (!open && collection?.id) {
            fetchFlashcardsData(collection.id);
          }
        }}
      >
        <DialogContent className="min-h-[80vh] min-w-[80vw] max-w-[80vw] max-h-[80vh] flex-1 flex items-center justify-center bg-background/95 dark:bg-zinc-900/95 backdrop-blur-lg border border-gray-200/20 dark:border-purple-900/30 shadow-xl shadow-purple-500/10">
          <AIGenerator collection={collection} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSpacedStudyOpen} onOpenChange={setIsSpacedStudyOpen}>
        <DialogContent className="min-h-[80vh] min-w-[80vw] max-w-[80vw] max-h-[80vh] flex-1 flex items-center justify-center bg-background/95 dark:bg-zinc-900/95 backdrop-blur-lg border border-gray-200/20 dark:border-purple-900/30 shadow-xl shadow-purple-500/10">
          <SpacedStudyMode
            collection={collection}
            onClose={() => {
              setIsSpacedStudyOpen(false);
              fetchFlashcardsData(collection.id);
            }}
          />
        </DialogContent>
      </Dialog>

      <StudyDialog
        isStudyDialogOpen={isStudyDialogOpen}
        setIsStudyDialogOpen={setIsStudyDialogOpen}
        studyMode={studyMode}
        setStudyMode={setStudyMode}
        collection={collection}
      />

      {canEdit && (
        <PetAgent
          resources={
            collectionResources.length > 0
              ? collectionResources
              : collection?.resources || []
          }
          collectionId={collection?.id}
          onFlashcardCreated={handleFlashcardAdded}
          onNoteSaved={handleNoteSaved}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
