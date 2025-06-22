"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FileText, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import TiptapEditor from "@/components/notes/TiptapEditor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadNote = async () => {
      try {
        if (noteId === "new") {
          if (isMounted) {
            setNote({ noteName: "Nueva nota", content: "" });
            const emptyDocument = {
              type: "doc",
              content: [{ type: "paragraph" }],
            };
            setContent(emptyDocument);
          }
          return;
        }

        const pathParts = window.location.pathname.split("/");
        const urlWorkspaceId = pathParts.includes("workspaces")
          ? pathParts[pathParts.indexOf("workspaces") + 1]
          : workspaceId;

        const noteResponse = await api.notes.get(
          urlWorkspaceId,
          collectionId,
          noteId
        );
        const foundNote = noteResponse.data;

        if (!isMounted) return;

        if (foundNote) {
          setNote(foundNote);

          if (!foundNote.content) {
            const emptyDocument = {
              type: "doc",
              content: [{ type: "paragraph" }],
            };
            setContent(emptyDocument);
          } else if (typeof foundNote.content === "string") {
            try {
              if (foundNote.content.trim().startsWith("{")) {
                const parsedContent = JSON.parse(foundNote.content);
                if (isMounted) {
                  setContent(parsedContent);
                }
              } else {
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

          const emptyDocument = {
            type: "doc",
            content: [{ type: "paragraph" }],
          };
          setContent(emptyDocument);
        }
      }
    };

    loadNote();

    return () => {
      isMounted = false;
    };
  }, [noteId, collectionId, workspaceId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const pathParts = window.location.pathname.split("/");
      const urlWorkspaceId = pathParts.includes("workspaces")
        ? pathParts[pathParts.indexOf("workspaces") + 1]
        : workspaceId;

      const contentToSave =
        typeof content === "object" ? JSON.stringify(content) : content;

      await api.notes.update(urlWorkspaceId, collectionId, parseInt(noteId), {
        noteName: note.noteName,
        content: contentToSave,
      });

      setLastSaved(new Date());
      toast.success("Nota guardada correctamente");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(
        "Error al guardar la nota: " + (error.message || "Error desconocido")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Guardado ahora";
    if (diff < 3600) return `Guardado hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Guardado hace ${Math.floor(diff / 3600)} h`;
    return `Guardado ${date.toLocaleDateString()}`;
  };

  return (
    <div className="flex flex-col h-screen bg-background w-full">
      {/* Header mejorado con responsive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      router.push(
                        `/workspaces/${workspaceId}/collection/${collectionId}`
                      )
                    }
                    className="hover:bg-accent rounded-lg transition-colors shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Volver a la colección</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={note?.noteName || ""}
                  onChange={(e) =>
                    setNote({ ...note, noteName: e.target.value })
                  }
                  className="text-lg sm:text-xl font-semibold bg-transparent border-none focus:outline-none text-foreground placeholder-muted-foreground w-full min-w-0"
                  placeholder="Título de la nota..."
                />

                {lastSaved && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {formatLastSaved(lastSaved)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-3 sm:px-6 rounded-lg transition-all duration-200"
            >
              {isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 mr-1 sm:mr-2"
                >
                  <Save className="h-4 w-4" />
                </motion.div>
              ) : (
                <Save className="h-4 w-4 mr-1 sm:mr-2" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? "Guardando..." : "Guardar"}
              </span>
              <span className="sm:hidden">{isSaving ? "..." : "Guardar"}</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Editor container con scroll interno y responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 overflow-hidden w-full"
      >
        <div className="h-full w-full">
          <TiptapEditor
            content={content}
            onChange={setContent}
            noteId={noteId}
            noteTitle={note?.noteName || "Documento"}
            placeholder="Comienza a escribir tu nota..."
          />
        </div>
      </motion.div>
    </div>
  );
}
