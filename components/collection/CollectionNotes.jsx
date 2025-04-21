"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useApi } from "@/lib/api";

import { Button } from "@/components/ui/button";

import NotesList from "@/components/notes/NotesList";
import CreateNoteDialog from "@/components/collection/CreateNoteDialog";

export default function CollectionNotes() {
  const [notes, setNotes] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { activeCollection } = useCollectionStore();
  const api = useApi();

  console.log(activeCollection);

  const { data: session } = useSession();
  const user = session?.user;

  const handleNoteCreated = useCallback((note) => {
    console.log(note);
    setNotes((prevNotes) => [...prevNotes, note]);
    setIsCreateDialogOpen(false);
  }, []);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await api.notes.getNotes(
          parseInt(activeCollection?.id)
        );

        setNotes(response);
      } catch (error) {
        console.error("Error loading notes:", error);
        toast.error("Error al cargar las notas");
      }
    };

    if (activeCollection) {
      loadNotes();
    }
  }, [activeCollection]);

  return (
    <div className="rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-8 shadow-xl shadow-purple-500/5">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-2.5">
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
              className="text-purple-500"
            >
              <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
              <path d="M15 3v6h6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Notas de Estudio
          </h2>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(!isCreateDialogOpen)}>
          Crear nota
        </Button>
        <CreateNoteDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          collectionId={activeCollection?.id}
          onNoteCreated={handleNoteCreated}
          user={user}
        />
      </div>

      <div>
        <NotesList notes={notes} />
      </div>

      {notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 mb-4">
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
              className="text-purple-500"
            >
              <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
              <path d="M15 3v6h6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            No hay notas aún
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
            ¡Comienza a crear notas para organizar mejor tu estudio! Puedes usar
            el botón "Nueva Nota" para empezar.
          </p>
        </div>
      )}
    </div>
  );
}
