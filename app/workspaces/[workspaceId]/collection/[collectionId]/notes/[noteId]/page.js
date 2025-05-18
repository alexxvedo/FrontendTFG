"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import TiptapEditor from "@/components/notes/TiptapEditor";
import { useNoteUsers } from "@/hooks/useNoteUsers";
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

  const { users, cursors, updateCursor, updateContent, isReady } = useNoteUsers(
    workspaceId,
    noteId,
    (newContent) => {
      setContent(newContent);
    }
  );

  useEffect(() => {
    console.log("Estado de cursores:", cursors);
    console.log("Usuarios en la nota:", users);
    console.log("Socket listo:", isReady);
  }, [cursors, users, isReady]);

  useEffect(() => {
    const loadNote = async () => {
      try {
        if (noteId === "new") {
          setNote({ noteName: "Nueva nota", content: "" });
          return;
        }

        const response = await api.notes.getNotes(collectionId);

        console.log("Notas cargadas:", response);

        const foundNote = response.find((note) => note.id === parseInt(noteId));
        if (foundNote) {
          console.log("Nota encontrada:", foundNote);
          console.log("Tipo de content:", typeof foundNote.content);
          
          setNote(foundNote);
          try {
            const parsedContent =
              typeof foundNote.content === "string" && foundNote.content
                ? JSON.parse(foundNote.content)
                : foundNote.content || "";
            console.log("Contenido parseado:", parsedContent);
            setContent(parsedContent);
          } catch (e) {
            console.error("Error parsing note content:", e);
            console.log("Contenido original:", foundNote.content);
            // Si no podemos parsear el contenido, usamos un documento vacío pero válido para Tiptap
            const emptyDocument = {
              type: "doc",
              content: [{ type: "paragraph" }]
            };
            setContent(emptyDocument);
          }
        }
      } catch (error) {
        console.error("Error loading note:", error);
        toast.error("Error al cargar la nota");
      }
    };

    loadNote();
  }, [noteId, collectionId]);

  const handleSave = async () => {
    try {
      console.log(JSON.stringify(content));
      setIsSaving(true);
      await api.notes.update(collectionId, parseInt(noteId), {
        noteName: note.noteName,
        content: JSON.stringify(content),
      });
      toast.success("Nota guardada correctamente");
      //router.push(`/workspaces/${workspaceId}/collection/${collectionId}`);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Error al guardar la nota");
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    updateContent(newContent);
  };

  const handleCursorUpdate = (cursorData) => {
    updateCursor(cursorData);
  };

  return (
    <div className="flex flex-col min-h-screen">
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
          <div className="flex -space-x-3">
            {users.map((user) => {
              const hue =
                Math.abs(
                  user.email
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                ) % 360;
              const cursorColor = `hsl(${hue}, 70%,50%)`;

              return (
                <TooltipProvider key={user.email}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar
                        className="border-[3px] w-10 h-10 cursor-pointer hover:scale-105 transition-transform "
                        style={{ borderColor: cursorColor }}
                      >
                        <AvatarImage src={user.image} />
                        <AvatarFallback>
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent
                      style={{
                        backgroundColor: cursorColor,
                        color: "white",
                      }}
                      className="rounded-lg shadow-lg"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-sm opacity-90">{user.email}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
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
      <div className="flex-1 overflow-y-auto px-0 pt-8  max-w-full mx-auto w-full overflow-hidden">
        <TiptapEditor
          content={content}
          onChange={handleContentChange}
          onCursorUpdate={handleCursorUpdate}
          cursors={cursors}
          placeholder="Empieza a escribir..."
        />
      </div>
    </div>
  );
}
