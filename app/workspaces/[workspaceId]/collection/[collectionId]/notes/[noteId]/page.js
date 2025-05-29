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
    // Flag to prevent multiple loads
    let isMounted = true;

    const loadNote = async () => {
      try {
        if (noteId === "new") {
          if (isMounted) {
            setNote({ noteName: "Nueva nota", content: "" });
            // Crear un documento vacío válido para Tiptap
            const emptyDocument = {
              type: "doc",
              content: [{ type: "paragraph" }],
            };
            setContent(emptyDocument);
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

          // Procesar el contenido para el editor Tiptap
          if (!foundNote.content) {
            // Si no hay contenido, usar un documento vacío
            const emptyDocument = {
              type: "doc",
              content: [{ type: "paragraph" }],
            };
            setContent(emptyDocument);
          } else if (typeof foundNote.content === "string") {
            try {
              // Intentar parsear como JSON primero
              if (foundNote.content.trim().startsWith("{")) {
                const parsedContent = JSON.parse(foundNote.content);
                console.log("Contenido parseado como JSON:", parsedContent);
                if (isMounted) {
                  setContent(parsedContent);
                }
              } else {
                // Si no es JSON, crear un documento Tiptap con el texto plano
                console.log("Creando documento Tiptap con texto plano");
                const textDocument = {
                  type: "doc",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: foundNote.content }],
                    },
                  ],
                };
                if (isMounted) {
                  setContent(textDocument);
                }
              }
            } catch (e) {
              console.error("Error procesando el contenido:", e);
              // Si hay error al parsear, crear un documento con el texto original
              const textDocument = {
                type: "doc",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: foundNote.content }],
                  },
                ],
              };
              if (isMounted) {
                setContent(textDocument);
              }
            }
          } else if (
            foundNote.content &&
            typeof foundNote.content === "object"
          ) {
            // Si ya es un objeto, usarlo directamente
            if (isMounted) {
              setContent(foundNote.content);
            }
          }
        }
      } catch (error) {
        console.error("Error loading note:", error);
        if (isMounted) {
          toast.error(
            "Error al cargar la nota: " + (error.message || "Error desconocido")
          );

          // En caso de error, crear un documento vacío
          const emptyDocument = {
            type: "doc",
            content: [{ type: "paragraph" }],
          };
          setContent(emptyDocument);
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

      // Asegurarse de que el contenido sea un string JSON
      const contentToSave =
        typeof content === "object" ? JSON.stringify(content) : content;

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
