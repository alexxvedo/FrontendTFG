"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Bot,
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  Trophy,
  Target,
  Zap,
  Flame,
  Book,
  Folder,
  StickyNote,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useStudySessionStore } from "@/store/studySession-store/studySession-store";
import { useSocket } from "@/context/socket";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import io from "socket.io-client";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import AIGenerator from "@/components/flashcards/AIGenerator";
import FlashcardList from "@/components/flashcards/FlashcardList";
import FlashcardEditor from "@/components/flashcards/FlashcardEditor";
import { FlashCard } from "@/components/flashcards/FlashCard";
import Link from "next/link";
import Stats from "@/components/flashcards/stats";
import { Skeleton } from "@/components/ui/skeleton";
import SpacedStudyMode from "@/components/flashcards/SpacedStudyMode";
import Agent from "@/components/agent/Agent";
import GameStats from "@/components/collection/GameStats";

import CollectionTabs from "@/components/collection/CollectionTabs";
import StudyDialog from "@/components/collection/StudyDialog";
import Background from "@/components/background/background";

import { Separator } from "@/components/ui/separator";

import PetAgent from "@/components/agent/PetAgent";
import CollectionStats from "@/components/collection/CollectionStats";
import CollectionResources from "@/components/collection/CollectionResources";
import CollectionNotes from "@/components/collection/CollectionNotes";
import FlashcardTabs from "@/components/collection/FlashcardTabs";

export default function CollectionPage() {
  const { workspaceId, collectionId } = useParams();
  const router = useRouter();
  const { activeWorkspace, updateActiveWorkspace, workspaces } =
    useSidebarStore();

  const { setActiveCollection } = useCollectionStore();

  const api = useApi();

  const socket = useSocket();

  const { data: session } = useSession();
  const user = session?.user;

  const [collection, setCollection] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [flashcardsDataBD, setFlashcardsDataBD] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("flashcards");
  const [openEditor, setOpenEditor] = useState(false);
  const [isSpacedStudyOpen, setIsSpacedStudyOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isStudyDialogOpen, setIsStudyDialogOpen] = useState(false);
  const [studyMode, setStudyMode] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        setIsLoading(true);

        const response = await api.collections.get(
          parseInt(workspaceId),
          parseInt(collectionId)
        );
        setCollection(response.data);
        setActiveCollection(response.data);

        // También cargar el workspace
        const workspaceResponse = await api.workspaces.get(
          parseInt(workspaceId)
        );
        setWorkspace(workspaceResponse.data);

        // Cargar las flashcards
        const flashcardsResponse = await api.flashcards.listByCollection(
          parseInt(collectionId)
        );

        // Cargar los documentos (recursos)
        const resourcesResponse = await api.resources.list(
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
        console.error("Error loading collection:", error);
        toast.error("Error al cargar la colección");
        setIsLoading(false);
      }
    };

    if (collectionId && workspaceId) {
      loadCollection();
    }
  }, [collectionId, workspaceId]);

  useEffect(() => {
    if (!user || !collection?.id) return;

    // Join collection room
    socket.emit(
      "join_collection",
      parseInt(workspaceId),
      parseInt(collection.id),
      {
        email: user.email,
        name: user.name,
        image: user.image,
      }
    );

    // Cleanup function
    return () => {
      if (collection?.id) {
        socket.emit(
          "leave_collection",
          parseInt(workspaceId),
          parseInt(collection.id)
        );
      }
    };
  }, [collection?.id, user, workspaceId, socket]);

  // Listen for active users updates
  useEffect(() => {
    if (!socket || !collection?.id) return;

    const handleCollectionUsersUpdate = (data) => {
      if (data.collectionId === parseInt(collection.id)) {
        setActiveUsers(data.users.filter((u) => u.email !== user?.email));
      }
    };

    const handleUserJoinCollection = (data) => {
      if (
        data.collectionId === parseInt(collection.id) &&
        data.user.email !== user?.email
      ) {
        toast.custom(
          (t) => (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/50 dark:border-green-800">
              <Avatar className="h-8 w-8 ring-1 ring-purple-500/20 dark:ring-pink-500/20">
                <AvatarImage
                  src={data.user.image || null}
                  alt={data.user.name}
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {data.user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-green-800 dark:text-green-200">
                {data.user.name || data.user.email} se ha unido a la colección
              </span>
            </div>
          ),
          { duration: 3000 }
        );
      }
    };

    const handleUserLeaveCollection = (data) => {
      if (
        data.collectionId === parseInt(collection.id) &&
        data.user.email !== user?.email
      ) {
        toast.custom(
          (t) => (
            <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/50 dark:border-orange-800">
              <Avatar className="h-8 w-8 ring-1 ring-purple-500/20 dark:ring-pink-500/20">
                <AvatarImage
                  src={data.user.image || null}
                  alt={data.user.name}
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {data.user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-orange-800 dark:text-orange-200">
                {data.user.name || data.user.email} ha abandonado la colección
              </span>
            </div>
          ),
          { duration: 3000 }
        );
      }
    };

    socket.on("collection_users_updated", handleCollectionUsersUpdate);
    socket.on("user_entered_collection", handleUserJoinCollection);
    socket.on("user_left_collection", handleUserLeaveCollection);

    // Request initial state
    socket.emit("get_collections_users", parseInt(workspaceId));

    return () => {
      socket.off("collection_users_updated", handleCollectionUsersUpdate);
      socket.off("user_entered_collection", handleUserJoinCollection);
      socket.off("user_left_collection", handleUserLeaveCollection);
    };
  }, [socket, collection?.id, user?.email, workspaceId]);

  const handleFlashcardAdded = useCallback(
    async (newFlashcard) => {
      try {
        // Actualizar la colección con la nueva flashcard
        const flashcardsResponse = await api.flashcards.listByCollection(
          parseInt(collectionId)
        );
        setCollection((prev) => ({
          ...prev,
          flashcards: flashcardsResponse.data,
        }));
        toast.success("Flashcard añadida correctamente");
      } catch (error) {
        console.error(
          "Error updating collection after adding flashcard:",
          error
        );
        toast.error("Error al actualizar la colección");
      }
    },
    [collectionId]
  );

  const handleNoteSaved = useCallback(
    async (noteData) => {
      try {
        // Actualizar la colección con la nueva nota
        const notesResponse = await api.notes.getNotes(parseInt(collectionId));
        setCollection((prev) => ({
          ...prev,
          notes: notesResponse,
        }));
        toast.success("Nota guardada correctamente");
      } catch (error) {
        console.error("Error updating collection after adding note:", error);
        toast.error("Error al actualizar la colección");
      }
    },
    [collectionId]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-500"></div>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Loading collection...
          </p>
        </div>
      </div>
    );
  }

  if (!collection || !workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Collection not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground dark:bg-[#0A0A0F] dark:text-white">
      <Background />

      <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-blue-900/20 bg-white/5 dark:bg-black/10">
        <div className="container min-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-5">
              <Link
                href={`/workspaces/${workspaceId}/collections`}
                className="flex items-center gap-2 text-zinc-600 hover:text-blue-400 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver</span>
              </Link>
              <div className="flex flex-col">
                <h2 className="text-3xl font-bold bg-clip-text ">
                  {collection.name}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/10">
                      <Star className="h-3 w-3 text-yellow-500" />
                    </div>
                    <span className="text-sm font-medium text-yellow-500">
                      Nivel {Math.floor(collection.flashcards?.length / 5) + 1}
                    </span>
                  </div>
                  <div className="h-3 w-px bg-zinc-700/50" />
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/10">
                      <Flame className="h-3 w-3 text-orange-500" />
                    </div>
                    <span className="text-sm font-medium text-orange-500">
                      {collection.flashcards?.length || 0} Flashcards
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center justify-between gap-4">
                {/* Botón Añadir Flashcard */}
                <button
                  onClick={() => setOpenEditor(true)}
                  className="relative group inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/5 backdrop-blur-sm px-4 text-sm font-medium text-zinc-200 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400/20 transition duration-300 hover:shadow-blue-500/20 hover:ring-blue-400/40"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Nueva Flashcard</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <div className="h-6 w-px bg-zinc-700/50" />

                {/* Botón Práctica Libre */}
                <button
                  onClick={() => {
                    setStudyMode("FREE");
                    setIsStudyDialogOpen(true);
                  }}
                  className="relative group inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:shadow-blue-500/30"
                >
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span className="font-medium">Práctica Libre</span>
                  </div>
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>

                {/* Botón Repaso Espaciado */}
                <button
                  onClick={() => {
                    setStudyMode("SPACED");
                    setIsStudyDialogOpen(true);
                  }}
                  className="relative group inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition duration-300 hover:shadow-purple-500/30"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Repaso Espaciado</span>
                  </div>
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 mb-4 bg-zinc-900/20 backdrop-blur-sm rounded-xl p-3 border border-zinc-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-300">
                  Progreso de la Colección
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Target className="h-3 w-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">
                    {Math.min(
                      100,
                      Math.floor(
                        ((collection.flashcards?.length || 0) / 20) * 100
                      )
                    )}
                    % Completado
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-zinc-400">
                {collection.flashcards?.length || 0}/20 Tarjetas
              </span>
            </div>
            <div className="h-2.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 relative"
                style={{
                  width: `${Math.min(
                    100,
                    Math.floor(
                      ((collection.flashcards?.length || 0) / 20) * 100
                    )
                  )}%`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-blue-900/20 opacity-50" />

      <div className="container relative min-w-full mx-auto px-6 pt-6">
        <div className="border-b border-border dark:border-gray-800 mb-6">
          <div className="flex space-x-6">
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

        <div className="mt-6">
          {activeTab === "flashcards" && (
            <FlashcardTabs collection={collection} isLoading={isLoading} />
          )}
          {activeTab === "stats" && <CollectionStats collection={collection} />}
          {activeTab === "resources" && (
            <CollectionResources collection={collection} />
          )}
          {activeTab === "notes" && <CollectionNotes />}
        </div>
      </div>
      <FlashcardEditor
        open={openEditor}
        onOpenChange={setOpenEditor}
        collection={collection}
        onFlashcardAdded={handleFlashcardAdded}
      />

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

      <PetAgent
        resources={collection.resources || []}
        collectionId={collection.id}
        onFlashcardCreated={handleFlashcardAdded}
        onNoteSaved={handleNoteSaved}
      />

      {/*
      <Agent
        resources={resources}
        collectionId={collection.id}
        onNoteCreated={setNotes}
        onFlashcardCreated={handleFlashcardAdded}
      />
       */}
    </div>
  );
}
