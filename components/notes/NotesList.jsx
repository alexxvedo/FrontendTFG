import { useRouter, useParams } from "next/navigation";
import { FileText } from "lucide-react";
import { useCollectionStore } from "@/store/collections-store/collection-store";

export default function NotesList({ notes = [] }) {
  const router = useRouter();
  const params = useParams();
  const { activeCollection } = useCollectionStore();

  const handleEditNote = (noteId) => {
    router.push(
      `/workspaces/${params.workspaceId}/collection/${activeCollection.id}/notes/${noteId}`
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleEditNote(note.id)}
            className="p-4 border rounded-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50 hover:border-purple-500 dark:hover:border-pink-500 cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-purple-500/10 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500 dark:text-pink-400" />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {note.noteName || "Nota sin título"}
              </span>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="col-span-full text-center py-8 text-zinc-500 dark:text-zinc-400">
            No hay notas en esta colección
          </div>
        )}
      </div>
    </div>
  );
}
