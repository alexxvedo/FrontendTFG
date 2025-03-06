import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import EditNote from "./EditNote";
import Image from "next/image";

const NotesList = memo(({ notes, onNotesUpdated }) => {
  const api = useApi();
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const handleDelete = async (noteId) => {
    try {
      setDeletingNoteId(noteId);
      await api.notes.delete(noteId);
      onNotesUpdated();
      toast.success("Nota eliminada", {
        description: "La nota ha sido eliminada correctamente.",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar la nota. Inténtalo de nuevo.",
      });
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
  };

  const handleNoteUpdated = () => {
    onNotesUpdated();
    setEditingNote(null);
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
        <p>No hay notas en esta colección.</p>
        <p className="mt-2">Crea una nueva nota para empezar.</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[calc(100vh-20rem)] px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          <AnimatePresence>
            {notes?.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="group"
              >
                <Card className="relative overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {note.noteName}
                      </h3>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(note)}
                          className="h-8 w-8 hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                        >
                          <Edit className="h-4 w-4 text-indigo-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(note.id)}
                          className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/20"
                          disabled={deletingNoteId === note.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div
                      className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-600">
                      <span>
                        {new Date(note.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        {note.createdBy?.image && note.createdBy.image !== "" ? (
                          <Image
                            src={note.createdBy.image}
                            alt={note.createdBy.name || "Usuario"}
                            width={24}
                            height={24}
                            className="rounded-full ring-2 ring-white dark:ring-zinc-800"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center ring-2 ring-white dark:ring-zinc-800">
                            <span className="text-sm text-white font-medium">
                              {(note.createdBy?.name || "U")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span>{note.createdBy?.name || "Usuario"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {editingNote && (
        <EditNote
          note={editingNote}
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          onNoteUpdated={handleNoteUpdated}
        />
      )}
    </>
  );
});

NotesList.displayName = "NotesList";

export default NotesList;
