"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Tag,
  Edit,
  Trash2,
  StickyNote,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  SortAsc,
  SortDesc,
} from "lucide-react";

import NotesList from "@/components/notes/NotesList";
import CreateNoteDialog from "@/components/collection/CreateNoteDialog";

export default function CollectionNotes() {
  const [notes, setNotes] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // date, title
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { activeCollection } = useCollectionStore();
  const api = useApi();

  const { data: session } = useSession();
  const user = session?.user;

  const handleNoteCreated = useCallback((note) => {
    setNotes((prevNotes) => [...prevNotes, note]);
    setIsCreateDialogOpen(false);
    toast.success("Nota creada correctamente");
  }, []);

  useEffect(() => {
    // Solo cargar las notas si no se han cargado antes o si cambia la colección activa
    if (activeCollection && (!hasLoaded || notes.length === 0)) {
      const loadNotes = async () => {
        setIsLoading(true);
        try {
          // Extraer el workspaceId de la URL o usar uno predeterminado
          // Formato de URL esperado: /workspaces/:workspaceId/collections/:collectionId
          const pathParts = window.location.pathname.split("/");
          const workspaceId = pathParts.includes("workspaces")
            ? pathParts[pathParts.indexOf("workspaces") + 1]
            : "25";

          console.log("Cargando notas con:", {
            workspaceId,
            collectionId: activeCollection?.id,
          });

          const response = await api.notes.getNotes(
            parseInt(workspaceId),
            parseInt(activeCollection?.id)
          );

          setNotes(response);
          setHasLoaded(true);
        } catch (error) {
          console.error("Error loading notes:", error);
          toast.error(
            "Error al cargar las notas: " +
              (error.message || "Error desconocido")
          );
        } finally {
          setIsLoading(false);
        }
      };

      loadNotes();
    }
  }, [activeCollection, hasLoaded, notes.length]);

  // Filtrar y ordenar notas - Usando useMemo para evitar recálculos innecesarios
  const filteredNotes = useMemo(() => {
    return notes
      .filter(
        (note) =>
          (note.title?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (note.content?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (note.noteName?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          )
      )
      .sort((a, b) => {
        if (sortBy === "date") {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          // Por título
          const titleA = a.title || a.noteName || "";
          const titleB = b.title || b.noteName || "";
          return sortOrder === "asc"
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA);
        }
      });
  }, [notes, searchQuery, sortBy, sortOrder]);

  return (
    <div className="rounded-xl bg-white/5 dark:bg-zinc-900/20 backdrop-blur-sm border border-zinc-200/30 dark:border-zinc-800/30 p-6 shadow-xl shadow-purple-500/5">
      {/* Barra superior con título, búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Notas de Estudio
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-blue-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center bg-zinc-900/70 border border-zinc-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setSortBy("date")}
                className={`px-3 py-2 text-sm ${
                  sortBy === "date"
                    ? "bg-blue-900/30 text-blue-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSortBy("title")}
                className={`px-3 py-2 text-sm ${
                  sortBy === "title"
                    ? "bg-blue-900/30 text-blue-400"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Tag className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 border-l border-zinc-800"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </button>
            </div>

            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de notas */}
      <div className="min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-blue-400 animate-spin mb-4" />
            <p className="text-zinc-400">Cargando notas...</p>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-4">
            <NotesList notes={filteredNotes} />
          </div>
        ) : notes.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-zinc-900/30 rounded-xl border border-zinc-800/50">
            <Search className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="mb-2 text-lg font-semibold text-zinc-100">
              No se encontraron resultados
            </h3>
            <p className="text-sm text-zinc-400 max-w-md">
              No hay notas que coincidan con "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/30 rounded-xl border border-zinc-800/50">
            <div className="rounded-full bg-blue-900/20 p-4 mb-4">
              <StickyNote className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-zinc-100">
              No hay notas aún
            </h3>
            <p className="text-sm text-zinc-400 max-w-md mb-6">
              ¡Comienza a crear notas para organizar mejor tu estudio! Puedes
              usar el botón "Crear" para empezar.
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear primera nota
            </Button>
          </div>
        )}
      </div>

      <CreateNoteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        collectionId={activeCollection?.id}
        onNoteCreated={handleNoteCreated}
        user={user}
      />
    </div>
  );
}
