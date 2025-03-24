"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  BookOpen,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
  Layers,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";
import FlashcardItem from "@/components/flashcards/FlashcardItem";
import FlashcardsPreview from "@/components/flashcards/FlashcardsPreview";
import SummaryPreview from "@/components/notes/SummaryPreview";

const PetAgent = ({
  onFlashcardCreated,
  selectedCollection,
  resources = [],
  collectionId,
  onNoteSaved,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente de estudio inteligente. Puedo responder preguntas sobre tus documentos, generar resúmenes y crear flashcards para ayudarte a estudiar de manera más efectiva. ¿En qué puedo ayudarte hoy?",
    },
    {
      id: "options",
      role: "assistant",
      isOptions: true,
      content:
        "Selecciona una de las siguientes opciones o hazme una pregunta directamente:",
    },
  ]);

  const { data: session } = useSession();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para los diálogos
  const [flashcardDialog, setFlashcardDialog] = useState(false);
  const [summaryDialog, setSummaryDialog] = useState(false);
  const [detailedSummaryDialog, setDetailedSummaryDialog] = useState(false);

  // Estados para la generación de flashcards
  const [selectedDocument, setSelectedDocument] = useState("");
  const [numFlashcards, setNumFlashcards] = useState(5);
  const [documentContent, setDocumentContent] = useState("");
  const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
  const [flashcardStates, setFlashcardStates] = useState({});
  const scrollContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Estado para controlar la posición del botón
  const [buttonPosition, setButtonPosition] = useState("right");
  // Estado para controlar si el panel de contenido está expandido
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  // Estado para almacenar el tipo de contenido generado
  const [generatedContentType, setGeneratedContentType] = useState(null); // 'document', 'flashcards', null

  // Estado para los resúmenes generados
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isSummaryDetailed, setIsSummaryDetailed] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const api = useApi();

  // Scroll al final de los mensajes cuando se añade uno nuevo
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        window.requestAnimationFrame(() => {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        });
      }
    };
    scrollToBottom();
  }, [messages]);

  // Enfoque en el input cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // Añadir mensaje del usuario
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowOptions(false);
    setIsTyping(true);

    try {
      // Llamada a la API para obtener respuesta del agente
      const response = await api.agent.askQuestion(collectionId, input);

      // Crear el mensaje de respuesta del asistente
      const botResponse = {
        role: "assistant",
        content: response.data.answer || "No pude generar una respuesta.",
        sources: response.data.sources || [],
        is_general_answer: response.data.is_general_answer || false,
      };

      // Añadir mensaje de respuesta del asistente
      setMessages((prev) => [...prev, botResponse]);

      // Añadir mensaje de opciones después de la respuesta
      const optionsMessage = {
        role: "assistant",
        isOptions: true,
        content: "¿Qué más te gustaría hacer?",
      };

      // Pequeño retraso para que el usuario pueda leer la respuesta antes de mostrar las opciones
      setTimeout(() => {
        setMessages((prev) => [...prev, optionsMessage]);
        setIsTyping(false);
        setShowOptions(true);
      }, 1000);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast.error(
        "No se pudo enviar el mensaje: " +
          (error.message || "Error desconocido")
      );
      setIsTyping(false);
      setShowOptions(true);

      // Añadir mensaje de error como respuesta del asistente
      const errorMessage = {
        role: "assistant",
        content:
          "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Añadir mensaje de opciones incluso después de un error
      const optionsMessage = {
        role: "assistant",
        isOptions: true,
        content: "¿Qué te gustaría hacer ahora?",
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, optionsMessage]);
      }, 1000);
    }
  }, [input, collectionId, api.agent]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleGenerateFlashcards = useCallback(async () => {
    if (!selectedDocument) {
      toast.error("Por favor, selecciona un documento");
      return;
    }

    setIsLoading(true);
    try {
      // Obtener el contenido del documento seleccionado
      const selectedResource = resources.find((r) => r.id === selectedDocument);
      if (!selectedResource) {
        throw new Error("No se pudo obtener el contenido del documento");
      }

      console.log(selectedResource);

      // Llamada a la API para generar flashcards
      const response = await api.agent.generateFlashcardsFromDocument(
        collectionId,
        selectedResource.id,
        numFlashcards
      );

      console.log("Respuesta: ", response);

      // Guardar las flashcards generadas
      const flashcards = response.data || [];
      setGeneratedFlashcards(flashcards);

      // Añadir mensaje con las flashcards generadas
      const flashcardsMessage = {
        role: "assistant",
        content: `He generado ${
          flashcards.length
        } flashcards a partir del documento "${
          selectedResource.fileName || "seleccionado"
        }".`,
        hasFlashcards: true,
        flashcards: flashcards,
        documentName: selectedResource.fileName || "documento",
      };

      setMessages((prev) => [...prev, flashcardsMessage]);
      setFlashcardDialog(false);

      // Expandir el panel lateral para mostrar las flashcards
      setGeneratedContentType("flashcards");
      setIsContentExpanded(true);

      toast.success("Flashcards generadas correctamente");
    } catch (error) {
      console.error("Error generando flashcards:", error);
      toast.error("Error al generar las flashcards: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDocument, numFlashcards, collectionId, api.agent]);

  const handleGenerateSummary = useCallback(
    async (isDetailed = false) => {
      if (!selectedDocument) {
        toast.error("Por favor, selecciona un documento");
        return;
      }

      setIsLoading(true);
      try {
        // Obtener el contenido del documento seleccionado
        const selectedResource = resources.find(
          (r) => r.id === selectedDocument
        );
        if (!selectedResource) {
          throw new Error("No se pudo obtener el contenido del documento");
        }

        console.log("Generando resumen para:", selectedResource);

        let response;

        if (!isDetailed) {
          // Llamada a la API para generar resumen
          response = await api.agent.generateBriefSummaryFromDocument(
            collectionId,
            selectedResource.id
          );
        } else {
          // Llamada a la API para generar resumen detallado
          response = await api.agent.generateLongSummaryFromDocument(
            collectionId,
            selectedResource.id
          );
        }

        console.log("Respuesta del resumen:", response);

        // Formatear el contenido del resumen según sea detallado o breve
        let summaryContent = response.summary;

        // Guardar el resumen generado
        setGeneratedSummary(summaryContent);
        setIsSummaryDetailed(isDetailed);

        const summaryMessage = {
          role: "assistant",
          content: `He generado un ${
            isDetailed ? "resumen detallado" : "resumen breve"
          } a partir del documento "${
            selectedResource.fileName || "seleccionado"
          }".`,
          hasSummary: true,
          summaryContent: summaryContent,
          summaryType: isDetailed ? "detailed" : "brief",
          documentName: selectedResource.fileName || "documento",
        };

        setMessages((prev) => [...prev, summaryMessage]);
        setSummaryDialog(false);
        setDetailedSummaryDialog(false);

        // Expandir el panel lateral para mostrar el resumen
        setGeneratedContentType("summary");
        setIsContentExpanded(true);

        toast.success(
          `${
            isDetailed ? "Resumen detallado" : "Resumen breve"
          } generado correctamente`
        );
      } catch (error) {
        console.error("Error generando resumen:", error);
        toast.error(
          "Error al generar el resumen: " +
            (error.message || "Error desconocido")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDocument, collectionId, api.agent]
  );

  // Función para abrir el chat
  const handleOpenChat = useCallback(() => {
    // Primero movemos el botón al centro
    setButtonPosition("center");

    // Después de un breve retraso, abrimos el chat
    setTimeout(() => {
      setIsOpen(true);
    }, 200); // Reducido de 500ms a 200ms para mayor fluidez
  }, []);

  // Función para cerrar el chat
  const handleCloseChat = useCallback(() => {
    // Primero cerramos el chat
    setIsOpen(false);
    // También cerramos el panel de contenido si está abierto
    setIsContentExpanded(false);

    // Después de un breve retraso, movemos el botón de vuelta a la derecha
    setTimeout(() => {
      setButtonPosition("right");
    }, 200); // Reducido de 500ms a 200ms para mayor fluidez
  }, []);

  // Función para generar contenido de ejemplo (documento o flashcards)
  const generateContent = useCallback((type) => {
    setGeneratedContentType(type);
    setIsContentExpanded(true);
  }, []);

  // Función para alternar la visibilidad del panel de contenido
  const toggleContentPanel = useCallback(() => {
    setIsContentExpanded(!isContentExpanded);
  }, [isContentExpanded]);

  // Componente para mostrar un documento de ejemplo
  const DocumentPreview = memo(() => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <h3 className="font-semibold text-white flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Documento Generado
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
      <div className="flex-1 p-4 overflow-auto">
        <div className="prose prose-invert max-w-none">
          <h1>Título del Documento</h1>
          <p>
            Este es un documento de ejemplo generado por el asistente. Aquí
            podrías ver el contenido completo del documento, con formato y
            estructura.
          </p>
          <h2>Sección 1</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
            euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis
            aliquam nisl nunc quis nisl.
          </p>
          <h2>Sección 2</h2>
          <p>
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
          <ul>
            <li>Punto importante 1</li>
            <li>Punto importante 2</li>
            <li>Punto importante 3</li>
          </ul>
          <h2>Conclusión</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident.
          </p>
        </div>
      </div>
    </div>
  ));

  // Función para renderizar el diálogo de flashcards
  const renderFlashcardDialog = useCallback(() => {
    return (
      <Dialog open={flashcardDialog} onOpenChange={setFlashcardDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#0A0A0F] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Generar Flashcards</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right text-zinc-400">
                Documento
              </Label>
              <Select
                value={selectedDocument}
                onValueChange={setSelectedDocument}
              >
                <SelectTrigger className="col-span-3 bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Selecciona un documento" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.fileName || `Documento ${resource.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numCards" className="text-right text-zinc-400">
                Cantidad
              </Label>
              <Select
                value={numFlashcards.toString()}
                onValueChange={(value) => setNumFlashcards(parseInt(value))}
              >
                <SelectTrigger className="col-span-3 bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Número de flashcards" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectItem value="3">3 flashcards</SelectItem>
                  <SelectItem value="5">5 flashcards</SelectItem>
                  <SelectItem value="10">10 flashcards</SelectItem>
                  <SelectItem value="15">15 flashcards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleGenerateFlashcards}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            >
              {isLoading ? "Generando..." : "Generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [flashcardDialog, selectedDocument, numFlashcards, isLoading]);

  // Función para renderizar el diálogo de resumen breve
  const renderSummaryDialog = useCallback(() => {
    return (
      <Dialog open={summaryDialog} onOpenChange={setSummaryDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#0A0A0F] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Generar Resumen Breve
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right text-zinc-400">
                Documento
              </Label>
              <Select
                value={selectedDocument}
                onValueChange={setSelectedDocument}
              >
                <SelectTrigger className="col-span-3 bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Selecciona un documento" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.fileName || `Documento ${resource.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => handleGenerateSummary(false)}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            >
              {isLoading ? "Generando..." : "Generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [summaryDialog, selectedDocument, isLoading]);

  // Función para renderizar el diálogo de resumen detallado
  const renderDetailedSummaryDialog = useCallback(() => {
    return (
      <Dialog
        open={detailedSummaryDialog}
        onOpenChange={setDetailedSummaryDialog}
      >
        <DialogContent className="sm:max-w-[425px] bg-[#0A0A0F] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Generar Resumen Detallado
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right text-zinc-400">
                Documento
              </Label>
              <Select
                value={selectedDocument}
                onValueChange={setSelectedDocument}
              >
                <SelectTrigger className="col-span-3 bg-zinc-900 border-zinc-700">
                  <SelectValue placeholder="Selecciona un documento" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.fileName || `Documento ${resource.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => handleGenerateSummary(true)}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            >
              {isLoading ? "Generando..." : "Generar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [detailedSummaryDialog, selectedDocument, isLoading]);

  // Función para renderizar mensajes
  const renderMessage = useCallback((message, index) => {
    if (message.role === "user") {
      return (
        <div key={index} className="flex justify-end mb-4">
          <div className="bg-zinc-800/80 backdrop-blur-sm text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
            {message.content}
          </div>
        </div>
      );
    } else if (message.isOptions) {
      return (
        <div key={index} className="flex mb-4">
          <div className="bg-zinc-800/50 backdrop-blur-sm text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
            <p className="mb-3">{message.content}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlashcardDialog(true)}
                className="bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 text-zinc-200"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Flashcards
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSummaryDialog(true)}
                className="bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 text-zinc-200"
              >
                <FileText className="mr-2 h-4 w-4" />
                Resumen Breve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailedSummaryDialog(true)}
                className="bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 text-zinc-200"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Resumen Detallado
              </Button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div key={index} className="flex flex-col mb-4">
          <div className="flex mb-2">
            <div className="bg-zinc-800/50 backdrop-blur-sm text-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-2 last:mb-0" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-4 mb-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-4 mb-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      className="text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        className="bg-zinc-700/50 px-1 py-0.5 rounded text-sm"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-zinc-700/50 p-2 rounded-md text-sm overflow-x-auto my-2"
                        {...props}
                      />
                    ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Mostrar fuentes si están disponibles y no es una respuesta general */}
              {message.sources &&
                message.sources.length > 0 &&
                !message.is_general_answer && (
                  <div className="mt-3 pt-2 border-t border-zinc-700/50">
                    <p className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-1">
                      Fuentes de información:
                    </p>
                    <div className="space-y-1.5">
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-xs rounded bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-zinc-800/50"
                        >
                          <div className="px-2 py-1 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mr-2"></div>
                              <span className="text-zinc-300 font-medium">
                                {source.file_name}
                              </span>
                            </div>
                          </div>
                          {source.relevant_lines &&
                            source.relevant_lines.length > 0 && (
                              <div className="border-t border-zinc-800/50 px-2 py-1">
                                <div className="text-zinc-400 text-[10px] mb-1">
                                  Líneas relevantes:
                                </div>
                                <div className="space-y-1">
                                  {source.relevant_lines.map(
                                    (line, lineIdx) => (
                                      <div
                                        key={lineIdx}
                                        className="flex text-[10px]"
                                      >
                                        <span className="text-zinc-500 mr-2">
                                          L{line.line_number}:
                                        </span>
                                        <span className="text-zinc-300">
                                          {line.content}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Mostrar indicador de respuesta general si es el caso */}
              {message.is_general_answer && (
                <div className="mt-3 pt-2 border-t border-zinc-700/50">
                  <div className="flex items-center text-xs text-zinc-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 mr-2"></div>
                    <span>
                      Respuesta general basada en conocimiento del modelo
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mostrar contenido generado debajo del mensaje */}
          {message.hasSummary && (
            <div className="ml-8 mt-2 mb-4">
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-zinc-800 rounded-md overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                  <h4 className="font-medium text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                      {message.summaryType === "detailed"
                        ? "Resumen Detallado"
                        : "Resumen Breve"}{" "}
                      - {message.documentName}
                    </span>
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setGeneratedSummary(message.summaryContent);
                      setIsSummaryDetailed(message.summaryType === "detailed");
                      setGeneratedContentType("summary");
                      setIsContentExpanded(true);
                    }}
                    className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="p-3 max-h-40 overflow-y-auto text-sm text-zinc-300">
                  <ReactMarkdown>
                    {message.summaryContent.length > 300
                      ? message.summaryContent.substring(0, 300) + "..."
                      : message.summaryContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {message.hasFlashcards &&
            message.flashcards &&
            message.flashcards.length > 0 && (
              <div className="ml-8 mt-2 mb-4">
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-zinc-800 rounded-md overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                    <h4 className="font-medium text-sm flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {message.flashcards.length} Flashcards -{" "}
                        {message.documentName}
                      </span>
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setGeneratedFlashcards(message.flashcards);
                        setGeneratedContentType("flashcards");
                        setIsContentExpanded(true);
                      }}
                      className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="p-3 text-sm text-zinc-300">
                    <p>
                      Haz clic en el botón para ver todas las flashcards
                      generadas.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      );
    }
  }, []);

  return (
    <>
      {/* Botón flotante de la mascota */}
      <motion.div
        className="fixed bottom-6 z-50"
        style={{
          position: "fixed",
          zIndex: 9999,
          bottom: "1.5rem",
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={
          buttonPosition === "right"
            ? {
                y: 0,
                opacity: 1,
                right: "1.5rem",
                left: "auto",
                x: 0,
              }
            : {
                y: 0,
                opacity: 1,
                left: "calc(50vw - 32px)", // Centramos el botón
                right: "auto",
                x: 0,
              }
        }
        transition={{
          duration: 0.2,
          ease: [0.4, 0.0, 0.2, 1], // Curva de aceleración personalizada para mayor suavidad
        }}
      >
        <motion.button
          className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/30 dark:shadow-purple-500/20 hover:shadow-purple-900/50 dark:hover:shadow-purple-500/40 transition-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenChat}
        >
          {/* Efecto de brillo detrás del botón */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl animate-pulse" />

          <motion.div
            animate={{
              y: [0, -5, 0],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="relative z-10"
          >
            <Bot className="w-8 h-8" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Panel de chat */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <motion.div
              className={`relative flex h-[80vh] bg-[#0A0A0F] rounded-2xl shadow-xl overflow-hidden border border-zinc-800/50 transition-all duration-300 ${
                isContentExpanded ? "w-[90vw] max-w-[1200px]" : "w-[50vw]"
              }`}
              style={{
                width: isContentExpanded ? "90vw" : "50vw",
                maxWidth: isContentExpanded ? "1200px" : "xl",
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{
                duration: 0.15,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              {/* Efecto de gradiente en el fondo */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/20 to-pink-900/20 opacity-50" />

              {/* Orbes flotantes animados */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[15%] w-32 h-32 rounded-full bg-blue-600/10 blur-xl animate-float opacity-60" />
                <div
                  className="absolute top-[40%] right-[10%] w-24 h-24 rounded-full bg-purple-600/10 blur-xl animate-float opacity-60"
                  style={{ animationDelay: "1s" }}
                />
                <div
                  className="absolute bottom-[20%] left-[25%] w-28 h-28 rounded-full bg-pink-600/10 blur-xl animate-float opacity-60"
                  style={{ animationDelay: "2s" }}
                />
              </div>

              {/* Panel de chat (siempre visible) */}
              <div
                className={`relative flex flex-col ${
                  isContentExpanded
                    ? "w-1/2 border-r border-zinc-800/50"
                    : "w-full"
                }`}
              >
                {/* Cabecera */}
                <div className="relative flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white">
                      Asistente de Estudio
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseChat}
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Área de mensajes */}
                <ScrollArea className={`relative p-4 z-10 h-[calc(80vh-8rem)]`}>
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      // Añadimos información sobre contenido generado a los mensajes del asistente
                      if (
                        message.role === "assistant" &&
                        message.id === "options"
                      ) {
                        return renderMessage(message, index);
                      } else if (
                        message.role === "assistant" &&
                        message.id === "welcome"
                      ) {
                        return renderMessage(
                          {
                            ...message,
                            hasGeneratedContent: generatedContentType !== null,
                            contentType: generatedContentType,
                          },
                          index
                        );
                      } else {
                        return renderMessage(message, index);
                      }
                    })}
                    {isTyping && (
                      <div className="flex mb-4">
                        <div className="bg-zinc-800/50 backdrop-blur-sm text-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
                            <div
                              className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Área de entrada */}
                <div className="relative p-4 border-t border-zinc-800/80 bg-zinc-900/80 backdrop-blur-sm z-10">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 bg-zinc-800/50 border-zinc-700 focus-visible:ring-purple-500"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isTyping || !input.trim()}
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </div>

              {/* Panel de contenido generado (visible solo cuando está expandido) */}
              {isContentExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.15,
                    ease: [0.4, 0.0, 0.2, 1],
                  }}
                  className="relative flex flex-col border-l border-zinc-800/50 overflow-hidden w-1/2"
                  style={{
                    background:
                      "linear-gradient(to bottom right, rgba(30, 41, 59, 0.2), rgba(124, 58, 237, 0.05), rgba(219, 39, 119, 0.05))",
                  }}
                >
                  {generatedContentType === "document" ? (
                    <DocumentPreview />
                  ) : generatedContentType === "flashcards" ? (
                    <FlashcardsPreview
                      generatedFlashcards={generatedFlashcards}
                      collectionId={collectionId}
                      onFlashcardCreated={onFlashcardCreated}
                      toggleContentPanel={toggleContentPanel}
                      scrollContainerRef={scrollContainerRef}
                    />
                  ) : generatedContentType === "summary" ? (
                    <SummaryPreview
                      summaryContent={generatedSummary}
                      collectionId={collectionId}
                      toggleContentPanel={toggleContentPanel}
                      isDetailed={isSummaryDetailed}
                      onNoteSaved={onNoteSaved}
                      user={session.user}
                    />
                  ) : null}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diálogo para generar flashcards */}
      {renderFlashcardDialog()}
      {renderSummaryDialog()}
      {renderDetailedSummaryDialog()}
    </>
  );
};

export default memo(PetAgent);
