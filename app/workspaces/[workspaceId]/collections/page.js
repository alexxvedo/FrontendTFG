"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { toast } from "sonner";
import { CollectionsList } from "@/components/collections/collections-list";
import { useWorkspaceSocket } from "@/components/workspace/workspace-socket-provider";
import { motion } from "framer-motion";
import Background from "@/components/background/background";

// Componente envoltorio que tiene acceso al contexto del socket
function CollectionsListWithSocket({
  collections,
  onCollectionCreate,
  onCollectionUpdate,
  onCollectionDelete,
  handleCollectionClick,
}) {
  const { usersInCollection } = useWorkspaceSocket();

  return (
    <div className="relative min-h-screen">
      <Background />
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex-1 max-w-[1600px] mx-auto p-5 md:p-8 pt-6 min-h-screen"
      >
        <CollectionsList
          collections={collections}
          onCollectionCreate={onCollectionCreate}
          onCollectionUpdate={onCollectionUpdate}
          onCollectionDelete={onCollectionDelete}
          activeUsers={usersInCollection}
          handleCollectionClick={handleCollectionClick}
        />
      </motion.div>
    </div>
  );
}

export default function CollectionsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const api = useApi();

  // Asegúrate de que session ya está cargada antes de continuar
  const userSession = session?.user;
  const workspaceId = Array.isArray(params.workspaceId)
    ? params.workspaceId[0]
    : params.workspaceId;

  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const setActiveCollection = useCollectionStore(
    (state) => state.setActiveCollection
  );

  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollections = async () => {
    try {
      const response = await api.collections.listByWorkspace(workspaceId);
      setCollections(response.data);
    } catch (error) {
      console.error("Error al cargar colecciones:", error);
      toast.error("Error loading collections");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar colecciones al montar
  useEffect(() => {
    if (params.workspaceId) {
      fetchCollections();
    }
  }, [params.workspaceId]);

  const handleCollectionClick = (collectionId) => {
    // Solo navegamos a la colección, el join se hará en la página de la colección
    router.push(`/workspaces/${params.workspaceId}/collection/${collectionId}`);
  };

  const handleCreateCollection = async (collectionData) => {
    if (!workspaceId) {
      console.error("No workspace ID available");
      toast.error("Error: No workspace selected");
      return;
    }

    try {
      await api.collections.create(
        workspaceId,
        collectionData,
        userSession.email
      );
      await fetchCollections();
      toast.success("Collection created successfully");
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection");
      throw error;
    }
  };

  const handleUpdateCollection = async (collectionId, collectionData) => {
    if (!workspaceId) {
      console.error("No workspace ID available");
      toast.error("Error: No workspace selected");
      return;
    }

    try {
      await api.collections.update(workspaceId, collectionId, collectionData);
      await fetchCollections();
      toast.success("Collection updated successfully");
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection");
      throw error;
    }
  };

  const handleDeleteCollection = async (workspaceId, collectionId) => {
    if (!workspaceId || !collectionId) {
      console.error("No workspace ID available");
      toast.error("Error: No workspace selected");
      return;
    }

    try {
      await api.collections.delete(workspaceId, collectionId);
      await fetchCollections();
      toast.success("Collection deleted successfully");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
      throw error;
    }
  };

  // Redirigir si el workspace de la URL no coincide con el activo
  useEffect(() => {
    if (activeWorkspace && workspaceId !== activeWorkspace.id) {
      router.push(`/workspaces/${activeWorkspace.id}/collections`);
    }
  }, [activeWorkspace, workspaceId, router]);

  if (!workspaceId) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-screen bg-background dark:bg-[#0A0A0F]">
        <div className="text-lg text-muted-foreground flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-gray-100/80 dark:bg-gray-800/30">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10 text-gray-400 dark:text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <span>No workspace selected</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-screen bg-background dark:bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-purple-500 border-r-transparent border-b-pink-500 border-l-transparent"></div>
          <p className="text-muted-foreground">Cargando colecciones...</p>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-screen bg-background dark:bg-[#0A0A0F]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-purple-500 border-r-transparent border-b-pink-500 border-l-transparent"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen bg-background dark:bg-[#0A0A0F]">
      <CollectionsListWithSocket
        collections={collections}
        onCollectionCreate={handleCreateCollection}
        onCollectionUpdate={handleUpdateCollection}
        onCollectionDelete={handleDeleteCollection}
        handleCollectionClick={handleCollectionClick}
      />
    </div>
  );
}
