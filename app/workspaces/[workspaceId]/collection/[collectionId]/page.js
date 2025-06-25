"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Calendar,
  BookOpen,
  GraduationCap,
  BrainCircuit,
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
import CollectionCalendar from "@/components/collection/CollectionCalendar";

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
  const [isCreateNoteDialogOpen, setIsCreateNoteDialogOpen] = useState(false);
  const [isUploadResourceDialogOpen, setIsUploadResourceDialogOpen] =
    useState(false);
  const fileInputRef = useRef(null);

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          {/* Left side: Back button and collection title */}
          <div className="flex items-center">
            <Link
              href={`/workspaces/${workspaceId}`}
              className="flex items-center text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 mr-3"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">Volver</span>
            </Link>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {collection?.name}
              </h1>

              {!canEdit && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  Solo lectura
                </div>
              )}

              {/* User avatars */}
              <div className="flex -space-x-2 ml-3">
                {activeUsers.slice(0, 5).map((user, index) => (
                  <Avatar
                    key={user.email || index}
                    className="border-2 border-background dark:border-[#0A0A0F] h-10 w-10"
                  >
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {activeUsers.length > 5 && (
                  <div className="h-6 w-6 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center text-xs border-2 border-background dark:border-[#0A0A0F]">
                    +{activeUsers.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Study buttons - Modern Design */}
          <div className="relative flex flex-wrap gap-3">
            {/* Decorative background element */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-yellow-300/40 rounded-full blur-md animate-pulse"></div>

            <button
              onClick={() => {
                setStudyMode("normal");
                setIsStudyDialogOpen(true);
              }}
              className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl px-5 py-2.5 font-medium shadow-lg hover:shadow-blue-500/30 transition-all duration-300 border border-blue-400/20"
            >
              {/* Button background effects */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                  <Play className="h-3.5 w-3.5" fill="currentColor" />
                </div>
                <span className="relative">Estudio Normal</span>
              </div>
            </button>

            <button
              onClick={() => {
                setStudyMode("spaced");
                setIsStudyDialogOpen(true);
              }}
              className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl px-5 py-2.5 font-medium shadow-lg hover:shadow-purple-500/30 transition-all duration-300 border border-purple-400/20"
            >
              {/* Button background effects */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                  <Zap className="h-3.5 w-3.5" fill="currentColor" />
                </div>
                <span className="relative">Repaso Espaciado</span>
              </div>
            </button>
          </div>
        </div>

        <Separator className="my-3 bg-gray-200/10" />

        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-900/80 dark:to-gray-800/80 rounded-xl p-2 shadow-sm border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm">
            <div className="flex flex-1 overflow-x-auto hide-scrollbar">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("flashcards")}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    activeTab === "flashcards"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Flashcards
                </button>
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    activeTab === "calendar"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Calendario
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    activeTab === "notes"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <StickyNote className="h-4 w-4" />
                  Notas
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    activeTab === "resources"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  Recursos
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    activeTab === "stats"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Book className="h-4 w-4" />
                  Estadísticas
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-white/50 dark:bg-gray-800/30 rounded-lg p-6 shadow-sm border border-gray-200/20 dark:border-gray-700/30">
            {activeTab === "flashcards" && (
              <FlashcardTabs
                collection={collection}
                isLoading={isLoading}
                canEdit={canEdit}
              />
            )}
            {activeTab === "stats" && (
              <CollectionStats collection={collection} />
            )}
            {activeTab === "resources" && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files?.length > 0) {
                      // Crear un FormData para enviar los archivos
                      const formData = new FormData();
                      for (let i = 0; i < e.target.files.length; i++) {
                        formData.append("file", e.target.files[i]);
                      }

                      // Llamar a la API para subir los archivos
                      api.resources
                        .upload(
                          parseInt(workspaceId),
                          parseInt(collectionId),
                          formData
                        )
                        .then(() => {
                          toast.success("Recurso subido correctamente");
                          handleResourceUploaded();
                          // Limpiar el input
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        })
                        .catch((error) => {
                          console.error("Error al subir el recurso:", error);
                          toast.error("Error al subir el recurso");
                        });
                    }
                  }}
                  multiple
                  accept="*/*"
                />
                <CollectionResources
                  collection={collection}
                  canEdit={canEdit}
                  onResourceUploaded={handleResourceUploaded}
                />
              </>
            )}
            {activeTab === "notes" && (
              <CollectionNotes
                canEdit={canEdit}
                isCreateDialogOpen={isCreateNoteDialogOpen}
                setIsCreateDialogOpen={setIsCreateNoteDialogOpen}
              />
            )}
            {activeTab === "calendar" && (
              <CollectionCalendar
                collection={collection}
                user={user}
                workspaceId={workspaceId}
                collectionId={collectionId}
              />
            )}
          </div>
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
