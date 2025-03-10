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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpacedStudyMode from "@/components/flashcards/SpacedStudyMode";
import Agent from "@/components/agent/Agent";
import NotesList from "@/components/notes/NotesList";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function CollectionPage() {
  const { workspaceId, collectionId } = useParams();
  const router = useRouter();
  const { activeWorkspace, updateActiveWorkspace, workspaces } =
    useSidebarStore();
  const { updateStudySession } = useStudySessionStore();

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
  const [resources, setResources] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [notes, setNotes] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        setIsLoading(true);
        console.log("Loading collection with:", {
          workspaceId: parseInt(workspaceId),
          collectionId: parseInt(collectionId),
        });
        const response = await api.collections.get(
          parseInt(workspaceId),
          parseInt(collectionId)
        );
        console.log("Collection loaded:", response.data);
        setCollection(response.data);

        // También cargar el workspace
        const workspaceResponse = await api.workspaces.get(
          parseInt(workspaceId)
        );
        setWorkspace(workspaceResponse.data);

        // Cargar las flashcards
        const flashcardsResponse = await api.flashcards.listByCollection(
          parseInt(collectionId)
        );
        console.log("Flashcards loaded:", flashcardsResponse.data);
        setCollection((prev) => ({
          ...prev,
          ...response.data,
          flashcards: flashcardsResponse.data,
        }));

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
    const loadNotes = async () => {
      try {
        const response = await api.notes.getNotes(parseInt(collectionId));

        console.log("Loaded notes:", response);

        setNotes(response);
      } catch (error) {
        console.error("Error loading notes:", error);
        toast.error("Error al cargar las notas");
      }
    };

    if (collectionId) {
      loadNotes();
    }
  }, [collectionId]);

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
      console.log("Leaving collection:", collection.id);
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
      console.log("Collection users updated:", data);
      if (data.collectionId === parseInt(collection.id)) {
        setActiveUsers(data.users.filter((u) => u.email !== user?.email));
      }
    };

    const handleUserJoinCollection = (data) => {
      console.log("User joined collection:", data);
      if (
        data.collectionId === parseInt(collection.id) &&
        data.user.email !== user?.email
      ) {
        toast.custom(
          (t) => (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/50 dark:border-green-800">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={data.user.image || null}
                  alt={data.user.name}
                />
                <AvatarFallback>
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
      console.log("User left collection:", data);
      if (
        data.collectionId === parseInt(collection.id) &&
        data.user.email !== user?.email
      ) {
        toast.custom(
          (t) => (
            <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/50 dark:border-orange-800">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={data.user.image || null}
                  alt={data.user.name}
                />
                <AvatarFallback>
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

  const fetchFlashcardsData = useCallback(
    async (collectionId) => {
      try {
        const data = await api.flashcards.getStats(collectionId);
        setFlashcardsDataBD(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    },
    [api.flashcards]
  );

  const handleAddFlashcard = useCallback(() => {
    setOpenEditor(true);
  }, []);

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

  const handleCreateStudySession = useCallback(async () => {
    if (!collection?.id) return;

    try {
      const studySession = await api.studySessions.create({
        collectionId: collection.id,
      });

      console.log("Study session created:", studySession);

      updateStudySession(studySession);
      // Añadir wait de 10 segundos antes de redirigir
      await new Promise((resolve) => setTimeout(resolve, 10000));
      router.push(
        `/workspaces/${workspaceId}/collection/${collectionId}/studySession/${studySession.id}`
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la sesión de estudio");
    }
  }, [
    collection?.id,
    workspaceId,
    collectionId,
    router,
    updateStudySession,
    api.studySessions,
  ]);

  const handleFileUpload = async (files) => {
    try {
      setIsUploading(true);
      const uploadedFiles = [];

      for (const file of files) {
        setUploadingFiles((prev) => new Set([...prev, file.name]));
        try {
          const response = await api.resources.upload(collection.id, file);
          uploadedFiles.push({
            id: response.data.id,
            fileName: file.name,
            fileSize: file.size,
            type: file.type,
          });
        } finally {
          setUploadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(file.name);
            return newSet;
          });
        }
      }

      setResources((prev) => [...prev, ...uploadedFiles]);
      toast.success("Archivos subidos correctamente");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error al subir los archivos");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      console.log("Iniciando descarga...");

      // Obtener la respuesta con los encabezados
      const response = await api.resources.download(collection.id, documentId);

      console.log("🔍 Encabezados de la respuesta:", response.headers);

      if (!response || !response.data) {
        throw new Error("❌ La respuesta de la API es inválida o vacía");
      }

      // Obtener el nombre del archivo desde Content-Disposition
      const contentDisposition =
        response.headers["content-disposition"] ||
        response.headers["Content-Disposition"];
      console.log("📑 Content-Disposition recibido:", contentDisposition);

      let fileName = `archivo_${documentId}`; // Nombre por defecto

      if (contentDisposition) {
        console.log("📌 Procesando Content-Disposition...");

        // Buscar filename*=UTF-8''nombre.ext (si está codificado)
        let match = contentDisposition.match(/filename\*?=(UTF-8'')?([^;"']+)/);
        if (match && match[2]) {
          fileName = decodeURIComponent(match[2]);
        } else {
          // Si no está codificado, buscar filename="nombre.ext"
          match = contentDisposition.match(/filename="(.+?)"/);
          if (match && match[1]) {
            fileName = match[1];
          }
        }
      }

      console.log("📂 Nombre del archivo extraído:", fileName);

      // Crear un Blob con la respuesta
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Crear un enlace para descargar el archivo
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("✅ Archivo descargado correctamente");
    } catch (error) {
      console.error("❌ Error downloading file:", error);
      toast.error("Error al descargar el archivo");
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await api.resources.delete(collection.id, documentId);
      setResources((prev) => prev.filter((r) => r.id !== documentId));
      toast.success("Archivo eliminado correctamente");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error al eliminar el archivo");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files?.length) {
      handleFileUpload(files);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const loadResources = async () => {
      try {
        const response = await api.resources.list(collection.id);
        console.log("Loaded resources:", response.data);
        console.log("Resources:", response.data); // Añadir logs para verificar los recursos
        setResources(response.data);
      } catch (error) {
        console.error("Error loading resources:", error);
        toast.error("Error al cargar los recursos");
      }
    };

    if (collection?.id) {
      loadResources();
    }
  }, [collection?.id]);

  const handleNoteDeleted = (noteId) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection || !workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Collection not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="container min-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Link
                href={`/workspaces/${workspaceId}/collections`}
                className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Volver</span>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                {collection.name}
              </h1>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-between gap-3">
                {/* Botón Añadir Flashcard */}
                <button
                  onClick={() => setOpenEditor(true)}
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-zinc-950 shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition duration-300 hover:bg-zinc-50 hover:shadow-zinc-800/10 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700/50 dark:hover:bg-zinc-700/70 dark:hover:text-zinc-50"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Nueva Flashcard</span>
                </button>

                {/* Botón IA */}
                <button
                  onClick={() => setIsAIDialogOpen(true)}
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition duration-300 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-indigo-500/30 dark:from-indigo-400 dark:to-indigo-500 dark:shadow-indigo-400/20 dark:hover:from-indigo-300 dark:hover:to-indigo-400"
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

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700/50" />

                {/* Botón Práctica Libre */}
                <button
                  onClick={() => {
                    setStudyMode("FREE");
                    setIsStudyDialogOpen(true);
                  }}
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 text-sm font-medium text-white shadow-md shadow-emerald-500/20 transition duration-300 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30 dark:from-emerald-400 dark:to-emerald-500 dark:shadow-emerald-400/20 dark:hover:from-emerald-300 dark:hover:to-emerald-400"
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
                  className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 px-4 text-sm font-medium text-white shadow-md shadow-violet-500/20 transition duration-300 hover:from-violet-400 hover:to-violet-500 hover:shadow-violet-500/30 dark:from-violet-400 dark:to-violet-500 dark:shadow-violet-400/20 dark:hover:from-violet-300 dark:hover:to-violet-400"
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

      <div className="container min-w-full mx-auto px-6 pt-4 ">
        <div className="flex justify-center">
          <Tabs defaultValue="flashcards" className="w-full max-w-[full]">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-full  mx-auto mb-8 border    dark:border-zinc-800/20 shadow-xl shadow-indigo-500/5">
              <TabsTrigger
                value="flashcards"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
              >
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
                  className="lucide lucide-book-open"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Flashcards
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
              >
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
                  className="lucide lucide-bar-chart-3"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
                Estadísticas
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
              >
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
                  className="lucide lucide-folder"
                >
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>
                Recursos
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:shadow-lg"
              >
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
                  className="lucide lucide-sticky-note"
                >
                  <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
                  <path d="M15 3v6h6" />
                </svg>
                Notas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards">
              <div className="rounded-2xl max-h-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-xl shadow-indigo-500/5">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="inline-flex h-9 items-center justify-start rounded-full bg-zinc-100/50 dark:bg-zinc-800/30 p-1 text-zinc-500 dark:text-zinc-400 mb-8 space-x-1">
                    <TabsTrigger
                      value="all"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400"
                    >
                      Todas
                    </TabsTrigger>
                    <TabsTrigger
                      value="mastered"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400"
                    >
                      Dominadas
                    </TabsTrigger>
                    <TabsTrigger
                      value="learning"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400"
                    >
                      Aprendiendo
                    </TabsTrigger>
                    <TabsTrigger
                      value="new"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-indigo-400"
                    >
                      Nuevas
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-0">
                    <div className="grid grid-cols-1 gap-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                      ) : collection?.flashcards?.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                          <p>No hay flashcards en esta colección.</p>
                          <p className="mt-2">
                            ¡Crea una nueva flashcard para empezar!
                          </p>
                        </div>
                      ) : (
                        <FlashcardList flashcards={collection?.flashcards} />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="rounded-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-zinc-900/50 dark:to-zinc-900/30 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-8 shadow-xl shadow-indigo-500/5">
                <div className="min-w-full">
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Actividad Reciente */}
                      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/80 via-violet-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:via-violet-950/30 dark:to-purple-950/30 p-6 border border-indigo-100/50 dark:border-indigo-900/50 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                              >
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                              Actividad Reciente
                            </h3>
                          </div>
                          <div className="space-y-6">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                                Creadas hoy
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                                  {flashcardsDataBD?.creadasHoy || 0}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                  flashcards
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                                Últimos 7 días
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                  {flashcardsDataBD?.creadasUltimos7Dias || 0}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                  flashcards
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                                Últimos 30 días
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                  {flashcardsDataBD?.creadasUltimos30Dias || 0}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                  flashcards
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estado General */}
                      <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 p-6 border border-purple-100/50 dark:border-purple-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="rounded-full bg-purple-500/10 p-2.5 transition-all duration-300 group-hover:bg-purple-500/20 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-purple-500 transition-all duration-300 group-hover:rotate-12"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <path d="M21 3v5h-5" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-purple-500 after:to-fuchsia-500 after:transition-all after:duration-300 group-hover:after:w-full">
                            Estado General
                          </h3>
                        </div>
                        <div className="space-y-6">
                          {flashcardsDataBD?.estados?.map((estado) => (
                            <div key={estado.status}>
                              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                {estado.status === "SIN_HACER"
                                  ? "Por hacer"
                                  : estado.status === "REVISAR"
                                  ? "Para revisar"
                                  : "Completadas"}
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                  {estado.count}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                  flashcards ({Math.round(estado.porcentaje)}
                                  %)
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progreso */}
                      <div className="group rounded-2xl bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 p-6 border border-fuchsia-100/50 dark:border-fuchsia-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/10 hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="rounded-full bg-fuchsia-500/10 p-2.5 transition-all duration-300 group-hover:bg-fuchsia-500/20 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-fuchsia-500 transition-all duration-300 group-hover:rotate-12"
                            >
                              <path d="M12 20v-6" />
                              <path d="M12 14v-6" />
                              <path d="M12 8V2" />
                              <path d="M3 20c0-3.87 3.13-7 7-7" />
                              <path d="M14 13c3.87 0 7 3.13 7 7" />
                              <path d="M3 12c0-3.87 3.13-7 7-7" />
                              <path d="M14 5c3.87 0 7 3.13 7 7" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-fuchsia-500 after:to-pink-500 after:transition-all after:duration-300 group-hover:after:w-full">
                            Nivel de Conocimiento
                          </h3>
                        </div>
                        <div className="space-y-6">
                          {flashcardsDataBD?.nivelesConocimiento?.map(
                            (nivel) => (
                              <div key={nivel.nivel}>
                                <p className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 mb-1">
                                  {nivel.nivel === "MAL"
                                    ? "Necesita repaso"
                                    : nivel.nivel === "REGULAR"
                                    ? "En progreso"
                                    : "Dominadas"}
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                    {nivel.count}
                                  </p>
                                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    flashcards ({Math.round(nivel.porcentaje)}
                                    %)
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Segunda fila */}
                    <div className="grid grid-cols-3 gap-6">
                      {/* Revisiones */}
                      <div className="group rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6 border border-emerald-100/50 dark:border-emerald-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="rounded-full bg-emerald-500/10 p-2.5 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-emerald-500 transition-all duration-300 group-hover:rotate-12"
                            >
                              <path d="M3 2v6h6" />
                              <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500 after:transition-all after:duration-300 group-hover:after:w-full">
                            Revisiones
                          </h3>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                              Revisadas hoy
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.revisadasHoy || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                flashcards
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                              Últimos 7 días
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.revisadasUltimos7Dias || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                flashcards
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                              Últimos 30 días
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.revisadasUltimos30Dias || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                flashcards
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rendimiento */}
                      <div className="group rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 border border-amber-100/50 dark:border-amber-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="rounded-full bg-amber-500/10 p-2.5 transition-all duration-300 group-hover:bg-amber-500/20 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-amber-500 transition-all duration-300 group-hover:rotate-12"
                            >
                              <path d="m12 14 4-4" />
                              <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:transition-all after:duration-300 group-hover:after:w-full">
                            Rendimiento
                          </h3>
                        </div>
                        <div className="space-y-6">
                          <div className="transform transition-all duration-300 hover:-translate-y-1">
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                              Porcentaje de éxito
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 relative">
                                {Math.round(
                                  flashcardsDataBD?.porcentajeExito || 0
                                )}
                                <span className="text-2xl text-amber-500">
                                  %
                                </span>
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                de aciertos
                              </p>
                            </div>
                          </div>
                          <div className="transform transition-all duration-300 hover:-translate-y-1">
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                              Racha de estudio
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.rachaEstudio || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                días seguidos
                              </p>
                            </div>
                          </div>
                          <div className="transform transition-all duration-300 hover:-translate-y-1">
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                              Mejor racha
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.mejorRacha || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                días seguidos
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tiempo de Estudio */}
                      <div className="group rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 p-6 border border-sky-100/50 dark:border-sky-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="rounded-full bg-sky-500/10 p-2.5 transition-all duration-300 group-hover:bg-sky-500/20 group-hover:scale-110">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-sky-500 transition-all duration-300 group-hover:rotate-12"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-sky-500 after:to-blue-500 after:transition-all after:duration-300 group-hover:after:w-full">
                            Tiempo de Estudio
                          </h3>
                        </div>
                        <div className="space-y-6">
                          <div className="transform transition-all duration-300 hover:-translate-y-1">
                            <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mb-1">
                              Tiempo total
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {Math.round(
                                  (flashcardsDataBD?.tiempoEstudioTotal || 0) /
                                    60
                                )}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                minutos
                              </p>
                            </div>
                          </div>
                          <div className="transform transition-all duration-300 hover:-translate-y-1">
                            <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mb-1">
                              Promedio por sesión
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {Math.round(
                                  (flashcardsDataBD?.tiempoPromedioSesion ||
                                    0) / 60
                                )}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                minutos
                              </p>
                            </div>
                          </div>
                          <div className="transform transition-all duration-300 hover:-translate-y-1">
                            <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mb-1">
                              Sesiones totales
                            </p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                {flashcardsDataBD?.sesionesTotales || 0}
                              </p>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                sesiones
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-xl shadow-indigo-500/5">
                {/* Área de subida de archivos */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="mb-8 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center transition-colors duration-200 hover:border-indigo-500/50 dark:hover:border-indigo-400/50"
                >
                  <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-4"
                    >
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                      <path d="M12 12v9" />
                      <path d="m16 16-4-4-4 4" />
                    </svg>
                    <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      Arrastra tus archivos aquí
                    </h3>
                    <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                      o haz clic para seleccionar archivos
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={(e) =>
                        handleFileUpload(Array.from(e.target.files))
                      }
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                    >
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
                        className="h-4 w-4"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Seleccionar Archivos
                    </button>
                  </div>
                </div>

                {/* Lista de recursos */}
                <div className="space-y-4">
                  {/* Encabezado de la lista */}
                  <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Nombre</span>
                    <span>Tamaño</span>
                  </div>

                  {/* Recursos */}
                  {resources.map((resource) => (
                    <div
                      key={`resource-container-${resource.id}`}
                      className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm"
                    >
                      <div
                        key={`resource-item-${resource.id}`}
                        className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <div className="flex items-center gap-3">
                          {/* Icono basado en el tipo de archivo */}
                          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/50 p-2">
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
                              className="text-indigo-500 dark:text-indigo-400"
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L14.5 2z" />
                              <path d="M15 3v6h6" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {resource.fileName}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Subido {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {formatFileSize(resource.fileSize)}
                          </span>
                          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleDownload(resource.id)}
                              className="rounded-lg p-1 text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
                              title="Descargar"
                            >
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
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className="rounded-lg p-1 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                              title="Eliminar"
                            >
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
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Estado vacío */}
                  {resources.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L14.5 2z" />
                        <path d="M15 3v6h6" />
                      </svg>
                      <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                        No hay recursos
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Sube archivos para empezar
                      </p>
                    </div>
                  )}
                </div>

                {/* Indicador de carga */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      <span>Subiendo archivos...</span>
                    </div>
                    {Array.from(uploadingFiles).map((fileName) => (
                      <div
                        key={fileName}
                        className="mt-2 text-sm text-zinc-500 dark:text-zinc-400"
                      >
                        {fileName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-8 shadow-xl shadow-indigo-500/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-2.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-indigo-500"
                      >
                        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
                        <path d="M15 3v6h6" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      Notas de Estudio
                    </h2>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition duration-300 hover:from-indigo-400 hover:to-indigo-500 hover:shadow-indigo-500/30">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Nueva Nota</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nueva Nota</DialogTitle>
                        <DialogDescription>
                          Crea una nueva nota para tu colección
                        </DialogDescription>
                      </DialogHeader>
                      <Agent
                        collectionId={collection.id}
                        onNoteAdded={(newNote) => setNotes([...notes, newNote])}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <div>
                  <NotesList notes={notes} onNoteDeleted={handleNoteDeleted} />
                </div>

                {notes.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-indigo-500"
                      >
                        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
                        <path d="M15 3v6h6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      No hay notas aún
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                      ¡Comienza a crear notas para organizar mejor tu estudio!
                      Puedes usar el botón "Nueva Nota" para empezar.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
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
          <DialogContent className="min-h-[80vh] min-w-[80vw] max-w-[80vw] max-h-[80vh] flex-1 flex items-center justify-center">
            <AIGenerator collection={collection} />
          </DialogContent>
        </Dialog>

        <Dialog open={isSpacedStudyOpen} onOpenChange={setIsSpacedStudyOpen}>
          <DialogContent className="min-h-[80vh] min-w-[80vw] max-w-[80vw] max-h-[80vh] flex-1 flex items-center justify-center">
            <SpacedStudyMode
              collection={collection}
              onClose={() => {
                setIsSpacedStudyOpen(false);
                fetchFlashcardsData(collection.id);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isStudyDialogOpen} onOpenChange={setIsStudyDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {studyMode === "FREE" ? "Práctica Libre" : "Repaso Espaciado"}
              </DialogTitle>
              <DialogDescription>
                {studyMode === "FREE"
                  ? "Practica todas las tarjetas de la colección sin orden específico."
                  : "Repasa las tarjetas que necesitan ser revisadas según el algoritmo de repetición espaciada."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-4">
                <Button
                  onClick={async () => {
                    try {
                      const studySession = await api.studySessions.create({
                        collectionId: collection.id,
                        mode:
                          studyMode === "FREE" ? "FREE" : "SPACED_REPETITION",
                      });

                      console.log("Study session created:", studySession.data);

                      updateStudySession(studySession.data);
                      setIsStudyDialogOpen(false);
                      router.push(
                        `/workspaces/${workspaceId}/collection/${collectionId}/studySession/${studySession.data.id}`
                      );
                    } catch (error) {
                      console.error("Error:", error);
                      toast.error(
                        `Error al crear la sesión de ${
                          studyMode === "FREE" ? "práctica" : "repaso"
                        }`
                      );
                    }
                  }}
                  className={`w-full ${
                    studyMode === "FREE"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  Comenzar Sesión
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsStudyDialogOpen(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Agent
        resources={resources}
        collectionId={collection.id}
        onNoteCreated={setNotes}
        onFlashcardCreated={handleFlashcardAdded}
      />
    </div>
  );
}
