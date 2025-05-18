"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, Save, Check, X } from "lucide-react";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";

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

        const noteData = {
          noteName: noteTitle,
          content: summaryContent,
        };

        await api.notes.create(collectionId, noteData, user.email);

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
                  className="flex-1 bg-zinc-800/50 border-zinc-700 focus-visible:ring-purple-500"
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={isSaving || !noteTitle.trim()}
                  className={`transition-all duration-300 ${
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
                      Guardando
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
                  <Check className="w-4 h-4 mr-1" />
                  Nota guardada correctamente
                </span>
              </div>
            )}

            <div className="prose prose-invert max-w-none prose-headings:mt-6 prose-headings:mb-4 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-4 prose-p:leading-relaxed prose-li:my-2 prose-li:ml-4 prose-ul:my-4 prose-ol:my-4 prose-pre:my-4 prose-pre:p-4 prose-pre:bg-zinc-800/50 prose-pre:rounded-md prose-blockquote:my-4 prose-blockquote:pl-4 prose-blockquote:border-l-4 prose-blockquote:border-blue-500/50 prose-blockquote:italic prose-blockquote:text-zinc-300 prose-blockquote:bg-zinc-800/30 prose-blockquote:py-2 prose-blockquote:rounded-r-md text-zinc-200 text-base">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 pb-1 border-b border-zinc-700/50 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-medium text-blue-300 mt-5 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="my-3 leading-relaxed text-zinc-300" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-4 space-y-2 list-disc list-inside" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-4 space-y-2 list-decimal list-inside" {...props} />,
                  li: ({node, ...props}) => <li className="ml-4 text-zinc-300" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="my-4 pl-4 border-l-4 border-purple-500/50 italic text-zinc-300 bg-zinc-800/30 py-2 px-2 rounded-r-md" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-zinc-800 text-purple-300 px-1 py-0.5 rounded text-sm" {...props} />
                      : <code className="block bg-zinc-800/80 text-zinc-200 p-3 rounded-md my-4 overflow-x-auto text-sm" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-zinc-800/80 p-4 rounded-md my-4 overflow-x-auto" {...props} />,
                  hr: ({node, ...props}) => <hr className="my-6 border-zinc-700" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-zinc-700 border border-zinc-700 rounded-md" {...props} /></div>,
                  th: ({node, ...props}) => <th className="bg-zinc-800 px-4 py-2 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider" {...props} />,
                  td: ({node, ...props}) => <td className="px-4 py-2 border-t border-zinc-800 text-sm" {...props} />,
                }}
              >
                {summaryContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SummaryPreview.displayName = "SummaryPreview";

export default SummaryPreview;
