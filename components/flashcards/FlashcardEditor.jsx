import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useSession } from "next-auth/react";
import { Save, X, Grid, List, Maximize2, Minimize2 } from "lucide-react";

export default function FlashcardEditor({
  open,
  onOpenChange,
  collection,
  onFlashcardAdded,
  flashcardToEdit,
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" o "grid"
  const api = useApi();
  const { addFlashcard, updateFlashcard } = useCollectionStore();
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    if (open && collection) {
      fetchFlashcards();
      
      // Si hay una flashcard para editar, cargarla automáticamente
      if (flashcardToEdit) {
        startEditing(flashcardToEdit);
      }
    }
  }, [open, collection, flashcardToEdit]);

  useEffect(() => {
    if (!open) {
      setQuestion("");
      setAnswer("");
      setEditingFlashcard(null);
    }
  }, [open]);

  const fetchFlashcards = async () => {
    if (!collection?.id || !collection?.workspaceId) return;
    try {
      const response = await api.flashcards.listByCollection(
        collection.workspaceId,
        collection.id
      );
      setFlashcards(response.data);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("Error al cargar las flashcards");
    }
  };

  const saveFlashcard = async () => {
    if (!collection?.id || !collection?.workspaceId) return;

    try {
      setIsLoading(true);

      if (!question.trim() || !answer.trim()) {
        toast.error("La pregunta y la respuesta son obligatorias");
        setIsLoading(false);
        return;
      }

      let response;

      if (editingFlashcard) {
        // Actualizar flashcard existente
        response = await api.flashcards.update(
          collection.workspaceId,
          collection.id,
          editingFlashcard.id,
          {
            question: question,
            answer: answer,
          }
        );

        updateFlashcard(response.data);
        toast.success("Flashcard actualizada correctamente");
      } else {
        // Crear nueva flashcard
        response = await api.flashcards.create(collection.workspaceId, collection.id, {
          question: question,
          answer: answer,
          createdBy: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        });

        addFlashcard(response.data);
        toast.success("Flashcard creada correctamente");
      }

      // Limpiar el editor
      setQuestion("");
      setAnswer("");
      setEditingFlashcard(null);

      // Notificar al componente padre
      if (onFlashcardAdded) {
        onFlashcardAdded(response.data);
      }
    } catch (error) {
      console.error("Error saving flashcard:", error);
      toast.error("Error al guardar la flashcard");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (flashcard) => {
    setEditingFlashcard(flashcard);
    // Extraer el texto plano del HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = flashcard.question;
    setQuestion(tempDiv.textContent || tempDiv.innerText || flashcard.question);
    
    tempDiv.innerHTML = flashcard.answer;
    setAnswer(tempDiv.textContent || tempDiv.innerText || flashcard.answer);
  };
  
  const cancelEditing = () => {
    setEditingFlashcard(null);
    setQuestion("");
    setAnswer("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${viewMode === "grid" ? "max-w-7xl" : "max-w-5xl"} max-h-[90vh] overflow-hidden flex flex-col bg-[#0A0A0F] p-0 border border-zinc-800 shadow-lg transition-all duration-300`}
      >
        <DialogHeader className="px-8 pt-8 pb-4 relative overflow-hidden">
          {/* Efectos visuales sutiles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl opacity-40"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {editingFlashcard ? "Editar" : "Crear"} Flashcard
              </DialogTitle>
              <p className="text-gray-400 mt-1">
                {editingFlashcard 
                  ? "Modifica el contenido de tu flashcard existente" 
                  : "Crea una nueva flashcard para tu colección"}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full ${viewMode === "list" ? "bg-zinc-800" : ""}`}
                onClick={() => setViewMode("list")}
                title="Vista de lista"
              >
                <List className="h-4 w-4 text-gray-300" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full ${viewMode === "grid" ? "bg-zinc-800" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Vista de cuadrícula"
              >
                <Grid className="h-4 w-4 text-gray-300" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className={`flex-1 overflow-hidden grid grid-cols-1 ${viewMode === "grid" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-8 p-8 pt-4 relative`}>
          {/* Fondo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-blue-900/5 opacity-50 pointer-events-none"></div>
          
          {/* Lista/Grid de Flashcards */}
          <div className={`${viewMode === "grid" ? "col-span-2" : ""} border rounded-xl border-zinc-800/80 bg-zinc-900/90 overflow-hidden shadow-lg shadow-black/20 relative z-10`}>
            <div className="p-5 border-b border-zinc-800/80 bg-gradient-to-r from-zinc-900 to-zinc-900/95">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 w-1 h-5 rounded mr-2 inline-block"></span>
                Flashcards existentes
              </h3>
              <p className="text-sm text-gray-400 ml-3 mt-1">
                Haz clic en una flashcard para editarla
              </p>
            </div>

            <ScrollArea className="h-[550px]">
              {flashcards.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">+</span>
                  </div>
                  <p className="text-gray-400">
                    No hay flashcards en esta colección
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Crea una nueva para empezar
                  </p>
                </div>
              ) : viewMode === "list" ? (
                <div className="p-5 space-y-6">
                  {flashcards.map((flashcard) => (
                    <div
                      key={flashcard.id}
                      className="mb-6 group"
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 ${editingFlashcard?.id === flashcard.id 
                          ? "border-2 border-blue-500 shadow-lg shadow-blue-500/10" 
                          : "border border-zinc-800/80 hover:border-blue-500/50 group-hover:shadow-md group-hover:shadow-blue-500/5"} 
                          bg-gradient-to-br from-zinc-900 to-zinc-900/95 rounded-xl overflow-hidden`}
                        onClick={() => startEditing(flashcard)}
                      >
                        <div className="p-5">
                          <div className="mb-4 pb-3 border-b border-zinc-800/80">
                            <h4 className="font-medium text-base text-blue-400 mb-2 flex items-center">
                              <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">Q</span>
                              Pregunta
                            </h4>
                            <div
                              className="text-gray-200 pl-7"
                              dangerouslySetInnerHTML={{
                                __html: flashcard.question,
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-base text-purple-400 mb-2 flex items-center">
                              <span className="bg-purple-500/20 text-purple-400 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">A</span>
                              Respuesta
                            </h4>
                            <div
                              className="text-gray-200 pl-7"
                              dangerouslySetInnerHTML={{
                                __html: flashcard.answer,
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flashcards.map((flashcard) => (
                    <div
                      key={flashcard.id}
                      className="group h-full"
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 h-full ${editingFlashcard?.id === flashcard.id 
                          ? "border-2 border-blue-500 shadow-lg shadow-blue-500/10" 
                          : "border border-zinc-800/80 hover:border-blue-500/50 group-hover:shadow-md group-hover:shadow-blue-500/5"} 
                          bg-gradient-to-br from-zinc-900 to-zinc-900/95 rounded-xl overflow-hidden flex flex-col`}
                        onClick={() => startEditing(flashcard)}
                      >
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="mb-3 pb-3 border-b border-zinc-800/80 flex-1">
                            <h4 className="font-medium text-sm text-blue-400 mb-2 flex items-center">
                              <span className="bg-blue-500/20 text-blue-400 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">Q</span>
                              Pregunta
                            </h4>
                            <div
                              className="text-gray-200 text-sm pl-7 line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: flashcard.question,
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-purple-400 mb-2 flex items-center">
                              <span className="bg-purple-500/20 text-purple-400 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">A</span>
                              Respuesta
                            </h4>
                            <div
                              className="text-gray-200 text-sm pl-7 line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: flashcard.answer,
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Editor simplificado */}
          <div className="space-y-6 relative z-10">
            <div>
              <label className="flex items-center text-base font-semibold text-white mb-3">
                <span className="bg-blue-500/20 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">Q</span>
                Pregunta
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full h-56 p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/90 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none relative shadow-inner"
                  placeholder="Escribe aquí la pregunta..."
                />
              </div>
            </div>

            <div>
              <label className="flex items-center text-base font-semibold text-white mb-3">
                <span className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">A</span>
                Respuesta
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full h-56 p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/90 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none relative shadow-inner"
                  placeholder="Escribe aquí la respuesta..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              {editingFlashcard && (
                <Button
                  onClick={cancelEditing}
                  className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/90 px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:text-white overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-700/0 via-zinc-700/0 to-zinc-700/0 group-hover:from-zinc-700/20 group-hover:via-zinc-700/20 group-hover:to-zinc-700/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <X className="h-4 w-4 mr-1 relative z-10" />
                  <span className="relative z-10">Cancelar</span>
                </Button>
              )}
              <Button
                onClick={saveFlashcard}
                disabled={!question.trim() || !answer.trim() || isLoading}
                className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-purple-600/30 hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-400/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <Save className="h-4 w-4 mr-1 relative z-10" />
                <span className="relative z-10">{editingFlashcard ? "Actualizar" : "Guardar"}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
