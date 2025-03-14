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
import { Plus, Bot, ArrowLeft, Play, Clock, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
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

import CollectionTabs from "@/components/collection/CollectionTabs";
import StudyDialog from "@/components/collection/StudyDialog";
import Background from "@/components/background/background";

import { Separator } from "@/components/ui/separator";

import PetAgent from "@/components/agent/PetAgent";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [flashcardsDataBD, setFlashcardsDataBD] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [openEditor, setOpenEditor] = useState(false);
  const [isSpacedStudyOpen, setIsSpacedStudyOpen] = useState(false);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isStudyDialogOpen, setIsStudyDialogOpen] = useState(false);
  const [studyMode, setStudyMode] = useState(null);

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 dark:border-pink-500"></div>
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

      <div className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="container min-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Link
                href={`/workspaces/${workspaceId}/collections`}
                className="flex items-center gap-2 text-zinc-600 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver</span>
              </Link>
              <h2 className="text-3xl font-bold  bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                {collection.name}
              </h2>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-between gap-3">
                {/* Botón Añadir Flashcard */}
                <button
                  onClick={() => setOpenEditor(true)}
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-4 text-sm font-medium text-zinc-950 dark:text-zinc-200 shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:ring-zinc-700/50 transition duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:shadow-zinc-800/10 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Nueva Flashcard</span>
                </button>

                {/* 
                <button
                  onClick={() => setIsAIDialogOpen(true)}
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-4 text-sm font-medium text-white shadow-md shadow-purple-500/20 transition duration-300 hover:from-purple-400 hover:to-pink-500 hover:shadow-purple-500/30 dark:from-purple-400 dark:to-pink-500 dark:shadow-purple-400/20 dark:hover:from-purple-300 dark:hover:to-pink-400"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:rotate-180"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                      <path d="M5 3v4" />
                      <path d="M19 17v4" />
                      <path d="M3 5h4" />
                      <path d="M17 19h4" />
                    </svg>
                    <span className="font-medium">Generar con IA</span>
                  </div>
                </button>

                */}

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700/50" />

                {/* Botón Práctica Libre */}
                <button
                  onClick={() => {
                    setStudyMode("FREE");
                    setIsStudyDialogOpen(true);
                  }}
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition duration-300 hover:opacity-90 hover:shadow-indigo-500/30"
                >
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span className="font-medium">Práctica Libre</span>
                  </div>
                </button>

                {/* Botón Repaso Espaciado */}
                <button
                  onClick={() => {
                    setStudyMode("SPACED");
                    setIsStudyDialogOpen(true);
                  }}
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 text-sm font-medium text-white shadow-md shadow-purple-500/20 transition duration-300 hover:opacity-90 hover:shadow-purple-500/30"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Repaso Espaciado</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="container relative min-w-full mx-auto px-6 pt-4">
        <div className="flex justify-center">
          <CollectionTabs collection={collection} isLoading={isLoading} />
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
