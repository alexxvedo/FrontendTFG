"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, Save, Check, X } from "lucide-react";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";

const SummaryPreview = React.memo(
  ({
    summaryContent,
    collectionId,
    toggleContentPanel,
    isDetailed = false,
    onNoteSaved = () => {},
    user,
  }) => {
    const { data: session } = useSession();
    const api = useApi();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [noteTitle, setNoteTitle] = useState(
      isDetailed ? "Resumen Detallado" : "Resumen Breve"
    );

    // Procesar el contenido que puede venir en formato Tiptap JSON o texto plano
    const tiptapContent = useMemo(() => {
      if (!summaryContent) return null;

      // Intentar parsear el contenido como JSON (formato Tiptap)
      try {
        // Si es un string JSON, parsearlo
        if (
          typeof summaryContent === "string" &&
          (summaryContent.startsWith("{") ||
            summaryContent.includes('"type": "doc"'))
        ) {
          // Limpiar el string si contiene caracteres de escape adicionales
          let cleanContent = summaryContent;
          
          // Si el string tiene caracteres de escape adicionales (como cuando se muestra en la UI)
          if (summaryContent.includes('\\"')) {
            cleanContent = summaryContent.replace(/\\\\|\\"/g, match => 
              match === '\\\\' ? '\\' : '"'
            );
          }
          
          // Intentar parsear como JSON
          const parsedContent = JSON.parse(cleanContent);
          
          // Verificar si es un objeto Tiptap válido
          if (parsedContent && parsedContent.type === "doc") {
            console.log("Contenido Tiptap JSON detectado y parseado correctamente");
            return parsedContent;
          }
        }
      } catch (error) {
        console.log(
          "Error al parsear contenido como JSON, tratando como texto plano:",
          error
        );
      }

      // Si no es JSON o falla el parsing, crear un documento Tiptap con el texto plano
      console.log("Usando contenido como texto plano");
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: summaryContent }],
          },
        ],
      };
    }, [summaryContent]);

    // Configurar el editor Tiptap en modo solo lectura
    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight,
        Link,
        TextStyle,
        Color,
        Placeholder.configure({
          placeholder: "El contenido del resumen se mostrará aquí...",
        }),
      ],
      content: tiptapContent,
      editable: false, // Modo solo lectura
    });

    const handleSaveNote = useCallback(async () => {
      if (!session?.user?.email) {
        toast.error("Debes iniciar sesión para guardar notas");
        return;
      }

      if (!summaryContent) {
        toast.error("No hay contenido para guardar");
        return;
      }

      try {
        setIsSaving(true);

        // Guardar el contenido en formato Tiptap (JSON) para que sea compatible con el editor
        const noteData = {
          noteName: noteTitle,
          content: JSON.stringify(tiptapContent),
        };

        // Extraer el workspaceId de la URL o usar uno predeterminado
        // Formato de URL esperado: /workspaces/:workspaceId/collections/:collectionId
        const pathParts = window.location.pathname.split("/");
        const workspaceId = pathParts.includes("workspaces")
          ? pathParts[pathParts.indexOf("workspaces") + 1]
          : "25";

        // Asegurarse de que collectionId es un número válido
        const collectionIdNumber = parseInt(collectionId, 10);

        if (isNaN(collectionIdNumber)) {
          throw new Error("ID de colección inválido");
        }

        console.log("Guardando nota con los siguientes datos:", {
          workspaceId,
          collectionId: collectionIdNumber,
          email: session.user.email,
          noteData,
          contentFormat: "Tiptap JSON",
        });

        // Usar la función create del objeto notes en la API
        // La implementación espera: (workspaceId, collectionId, email, noteData)
        await api.notes.create(
          workspaceId,
          collectionIdNumber,
          session.user.email,
          noteData
        );

        setIsSaving(false);
        setIsSaved(true);
        onNoteSaved(noteData);
        toast.success("Nota guardada correctamente");
      } catch (error) {
        console.error("Error al guardar la nota:", error);
        setIsSaving(false);
        toast.error(
          "Error al guardar la nota: " + (error.message || "Error desconocido")
        );
      }
    }, [
      api,
      collectionId,
      isDetailed,
      noteTitle,
      onNoteSaved,
      session,
      summaryContent,
      tiptapContent, // Añadir tiptapContent como dependencia
    ]);

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <h3 className="font-semibold text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              {isDetailed ? "Resumen Detallado" : "Resumen Breve"}
            </span>
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleContentPanel}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/80"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 p-4 overflow-auto bg-[#0A0A0F]/90 backdrop-blur-sm">
          <div className="space-y-4">
            {!isSaved ? (
              <div className="mb-4 flex gap-2">
                <Input
                  placeholder="Título de la nota"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="flex-1 bg-zinc-800/50 border-zinc-700 text-white"
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className={`whitespace-nowrap ${
                    isSaving
                      ? "bg-zinc-700 text-zinc-300"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar como Nota
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="mb-4 text-sm flex items-center justify-center">
                <span className="text-green-400 flex items-center justify-center bg-green-900/20 px-3 py-2 rounded-md">
                  <Check className="w-4 h-4 mr-2" />
                  Nota guardada correctamente
                </span>
              </div>
            )}

            {/* Mostrar el contenido usando el editor Tiptap en modo solo lectura */}
            {editor ? (
              <div className="prose prose-invert max-w-none">
                <EditorContent editor={editor} className="min-h-[200px]" />
              </div>
            ) : (
              // Fallback a ReactMarkdown si el editor no está listo
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{summaryContent}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SummaryPreview.displayName = "SummaryPreview";

export default SummaryPreview;
