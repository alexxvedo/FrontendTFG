"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import MarkdownEditor from "@/components/notes/MarkdownEditor";
// Comentamos la importación del hook de usuarios ya que no usaremos la funcionalidad colaborativa por ahora
// import { useNoteUsers } from "@/hooks/useNoteUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function NotePage() {
  const { workspaceId, collectionId, noteId } = useParams();
  const router = useRouter();
  const api = useApi();
  const { data: session } = useSession();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Flag to prevent multiple loads
    let isMounted = true;

    const loadNote = async () => {
      try {
        if (noteId === "new") {
          if (isMounted) {
            setNote({ noteName: "Nueva nota", content: "" });
            setContent("");
          }
          return;
        }

        // Extraer el workspaceId de la URL
        const pathParts = window.location.pathname.split("/");
        const urlWorkspaceId = pathParts.includes("workspaces")
          ? pathParts[pathParts.indexOf("workspaces") + 1]
          : workspaceId;

        console.log("Cargando nota con:", {
          workspaceId: urlWorkspaceId,
          collectionId,
          noteId,
        });

        // Intentar obtener la nota directamente por su ID
        const noteResponse = await api.notes.get(
          urlWorkspaceId,
          collectionId,
          noteId
        );
        const foundNote = noteResponse.data;

        if (!isMounted) return;

        console.log("Nota cargada directamente:", foundNote);

        if (foundNote) {
          console.log("Nota encontrada:", foundNote);
          console.log("Tipo de content:", typeof foundNote.content);

          setNote(foundNote);

          if (!foundNote.content) {
            setContent("");
          } else if (typeof foundNote.content === "string") {
            setContent(foundNote.content);
          } else if (
            foundNote.content &&
            typeof foundNote.content === "object"
          ) {
            // If it's an object, assume it's Tiptap JSON and convert to Markdown.
            // This conversion logic needs to be implemented or imported.
            // For now, we'll stringify it. A proper conversion utility will be needed here.
            setContent(JSON.stringify(foundNote.content));
          }
        }
      } catch (error) {
        console.error("Error loading note:", error);
        if (isMounted) {
          toast.error(
            "Error al cargar la nota: " + (error.message || "Error desconocido")
          );

          setContent("");
        }
      }
    };

    loadNote();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [noteId, collectionId, workspaceId]);

  const handleSave = async () => {
    try {
      console.log("Guardando contenido:", content);
      setIsSaving(true);

      // Extraer el workspaceId de la URL
      const pathParts = window.location.pathname.split("/");
      const urlWorkspaceId = pathParts.includes("workspaces")
        ? pathParts[pathParts.indexOf("workspaces") + 1]
        : workspaceId;

      const contentToSave = content;

      console.log("Guardando nota con:", {
        workspaceId: urlWorkspaceId,
        collectionId,
        noteId,
        noteName: note.noteName,
        contentLength: contentToSave.length,
      });

      await api.notes.update(urlWorkspaceId, collectionId, parseInt(noteId), {
        noteName: note.noteName,
        content: contentToSave,
      });

      toast.success("Nota guardada correctamente");
      //router.push(`/workspaces/${workspaceId}/collection/${collectionId}`);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(
        "Error al guardar la nota: " + (error.message || "Error desconocido")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  return (
    <div className="flex flex-col min-h-screen h-screen">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(
                `/workspaces/${workspaceId}/collection/${collectionId}`
              )
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <input
            type="text"
            value={note?.noteName || ""}
            onChange={(e) => setNote({ ...note, noteName: e.target.value })}
            className="text-2xl font-semibold bg-transparent border-none focus:outline-none dark:text-white"
            placeholder="Título de la nota"
          />
        </div>
        <div className="flex items-center gap-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>
      <div
        className="flex-1 overflow-hidden px-6 pt-4 pb-4 max-w-full mx-auto w-full"
        style={{ height: "calc(100vh - 73px)" }}
      >
        <div style={{ height: "100%" }}>
          <MarkdownEditor
            content={content}
            noteName={note?.noteName}
            onChange={handleContentChange}
            placeholder="Empieza a escribir..."
          />
        </div>
      </div>
    </div>
  );
}
