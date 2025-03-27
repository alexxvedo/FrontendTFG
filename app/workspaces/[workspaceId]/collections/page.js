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
import Background from "@/components/background/background";
import { Separator } from "@/components/ui/separator";

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
      <div className="relative flex-1 space-y-4 p-4 md:p-8 pt-6 min-h-screen">
        <CollectionsList
          collections={collections}
          onCollectionCreate={onCollectionCreate}
          onCollectionUpdate={onCollectionUpdate}
          onCollectionDelete={onCollectionDelete}
          activeUsers={usersInCollection}
          handleCollectionClick={handleCollectionClick}
        />
      </div>
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
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-lg text-muted-foreground dark:text-gray-400">
          No workspace selected
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 dark:border-pink-500"></div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 dark:border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
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
