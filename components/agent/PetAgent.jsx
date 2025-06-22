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
  canEdit,
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
  const [showContextInput, setShowContextInput] = useState(false);
  const [additionalContext, setAdditionalContext] = useState("");

  // Estados para los diálogos
  const [flashcardDialog, setFlashcardDialog] = useState(false);
  const [summaryDialog, setSummaryDialog] = useState(false);
  const [detailedSummaryDialog, setDetailedSummaryDialog] = useState(false);

  // Estados para la generación de flashcards
  const [selectedDocument, setSelectedDocument] = useState("");
  const [numFlashcards, setNumFlashcards] = useState(5);
  const [summaryLength, setSummaryLength] = useState(500);
  const [documentContent, setDocumentContent] = useState("");
  const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
  const [flashcardStates, setFlashcardStates] = useState({});
  const scrollContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Estado para almacenar los recursos disponibles
  const [availableResources, setAvailableResources] = useState(resources);

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

  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStartTime, setLoadingStartTime] = useState(null);

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

  // Actualizar los recursos disponibles cuando cambian los props
  useEffect(() => {
    setAvailableResources(resources);
  }, [resources]);

  // Función para actualizar los recursos cuando se sube un nuevo documento
  const handleResourcesUpdated = (newResources) => {
    setAvailableResources((prevResources) => {
      // Combinar los recursos existentes con los nuevos
      const updatedResources = [...prevResources];

      // Añadir solo los recursos que no existen ya
      newResources.forEach((newResource) => {
        const exists = updatedResources.some((r) => r.id === newResource.id);
        if (!exists) {
          updatedResources.push(newResource);
        }
      });

      return updatedResources;
    });

    // Si no hay documento seleccionado, seleccionar el primero de los nuevos
    if (!selectedDocument && newResources.length > 0) {
      setSelectedDocument(newResources[0].id);
    }

    // Mostrar notificación
    toast.success("Nuevos documentos disponibles para consulta");
  };

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // Añadir mensaje del usuario
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowOptions(false);
    setIsTyping(true);

    try {
      // Preparar el historial de conversación para enviar al backend
      // Filtrar mensajes que no son opciones y limitar a los últimos 10 mensajes para mantener el contexto relevante
      const conversationHistory = messages
        .filter((msg) => !msg.isOptions && !msg.isWelcome)
        .slice(-10)
        .map((msg) => ({
          role: msg.role || "user", // Asegurar que siempre hay un rol
          content: msg.content || "", // Asegurar que siempre hay un contenido
        }));

      // Añadir la pregunta actual al historial
      conversationHistory.push({
        role: userMessage.role,
        content: userMessage.content,
      });

      console.log("Enviando historial de conversación:", conversationHistory);

      // Llamada a la API para obtener respuesta del agente
      const response = await api.agent.askQuestion(
        collectionId,
        input,
        null, // No hay contexto adicional
        conversationHistory
      );

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

  // Función para manejar mensajes de carga dinámicos
  useEffect(() => {
    let timeoutId;
    if (isLoading && loadingStartTime) {
      const updateLoadingMessage = () => {
        const elapsedTime = Date.now() - loadingStartTime;

        if (elapsedTime > 20000) {
          // > 20 segundos
          setLoadingMessage(
            "Esto está llevando más tiempo de lo esperado, pero sigo trabajando. Por favor, espera un momento más..."
          );
        } else if (elapsedTime > 10000) {
          // > 10 segundos
          setLoadingMessage(
            "Sigo procesando la información. Puede llevar un poco más de tiempo para asegurar la mejor calidad..."
          );
        } else if (elapsedTime > 5000) {
          // > 5 segundos
          setLoadingMessage(
            "Analizando el contenido y generando resultados de calidad..."
          );
        }

        timeoutId = setTimeout(updateLoadingMessage, 5000);
      };

      updateLoadingMessage();
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, loadingStartTime]);

  const handleGenerateFlashcards = useCallback(async () => {
    if (!selectedDocument) {
      toast.error("Por favor, selecciona un documento");
      return;
    }

    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setLoadingMessage("Iniciando generación de flashcards...");

    try {
      const selectedResource = resources.find((r) => r.id === selectedDocument);
      if (!selectedResource) {
        throw new Error("No se pudo obtener el contenido del documento");
      }

      setLoadingMessage("Analizando el contenido del documento...");
      const response = await api.agent.generateFlashcardsFromDocument(
        collectionId,
        selectedResource.id,
        numFlashcards
      );

      setGeneratedFlashcards(response.data || []);
      const flashcardsMessage = {
        role: "assistant",
        content: `He generado ${
          response.data.length
        } flashcards a partir del documento "${
          selectedResource.fileName || "seleccionado"
        }".`,
        hasFlashcards: true,
        flashcards: response.data,
        documentName: selectedResource.fileName || "documento",
      };

      setMessages((prev) => [...prev, flashcardsMessage]);
      setFlashcardDialog(false);
      setGeneratedContentType("flashcards");
      setIsContentExpanded(true);
      toast.success("Flashcards generadas correctamente");
    } catch (error) {
      console.error("Error generando flashcards:", error);
      toast.error("Error al generar las flashcards: " + error.message);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
      setLoadingStartTime(null);
    }
  }, [selectedDocument, numFlashcards, collectionId, api.agent]);

  const handleGenerateSummary = useCallback(
    async (isDetailed = false) => {
      if (!selectedDocument) {
        toast.error("Por favor, selecciona un documento");
        return;
      }

      setIsLoading(true);
      setLoadingStartTime(Date.now());
      setLoadingMessage(
        isDetailed
          ? "Iniciando generación del resumen detallado..."
          : "Iniciando generación del resumen breve..."
      );

      try {
        const selectedResource = resources.find(
          (r) => r.id === selectedDocument
        );
        if (!selectedResource) {
          throw new Error("No se pudo obtener el contenido del documento");
        }

        setLoadingMessage("Analizando el contenido del documento...");
        let response;

        if (!isDetailed) {
          response = await api.agent.generateBriefSummaryFromDocument(
            collectionId,
            selectedResource.id
          );
        } else {
          setLoadingMessage(
            "Generando resumen detallado. Esto puede tomar un poco más de tiempo..."
          );
          response = await api.agent.generateLongSummaryFromDocument(
            collectionId,
            selectedResource.id,
            summaryLength
          );
        }

        let summaryContent = response.summary;
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
        setLoadingMessage("");
        setLoadingStartTime(null);
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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-center text-sm text-zinc-400 animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="document"
                    className="text-right text-zinc-400"
                  >
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
                      {availableResources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.fileName || `Documento ${resource.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="numCards"
                    className="text-right text-zinc-400"
                  >
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
                      <SelectItem value="50">50 flashcards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
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
  }, [
    flashcardDialog,
    selectedDocument,
    numFlashcards,
    isLoading,
    loadingMessage,
  ]);

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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-center text-sm text-zinc-400 animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="document"
                    className="text-right text-zinc-400"
                  >
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
                      {availableResources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.fileName || `Documento ${resource.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
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
  }, [summaryDialog, selectedDocument, isLoading, loadingMessage]);

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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                <p className="text-center text-sm text-zinc-400 animate-pulse">
                  {loadingMessage}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="document"
                    className="text-right text-zinc-400"
                  >
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
                      {availableResources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.fileName || `Documento ${resource.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Label
                    htmlFor="document"
                    className="text-right text-zinc-400"
                  >
                    Número de palabras
                  </Label>
                  <Input
                    type="number"
                    min="100"
                    max="2000"
                    value={summaryLength}
                    onChange={(e) => setSummaryLength(parseInt(e.target.value))}
                    className="col-span-3 bg-zinc-900 border-zinc-700"
                  />
                </div>
              </>
            )}
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
  }, [
    detailedSummaryDialog,
    selectedDocument,
    summaryLength,
    isLoading,
    loadingMessage,
  ]);

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
              <div className="markdown-content">
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
              </div>

              {/* Mostrar fuentes si están disponibles, son relevantes y no es una respuesta general */}
              {message.sources &&
                message.sources.length > 0 &&
                !message.is_general_answer && (
                  <div className="mt-3 pt-2 border-t border-zinc-700/50">
                    <p className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-1">
                      Fuentes de información:
                    </p>
                    <div className="space-y-1.5">
                      {/* Mostrar solo documentos con líneas relevantes o alta puntuación de similitud */}
                      {message.sources
                        .filter(
                          (source) =>
                            (source.relevant_lines &&
                              source.relevant_lines.length > 0) ||
                            source.similarity_score >= 0.5
                        )
                        .map((source, idx) => (
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
                            {/* Mostrar líneas relevantes si existen, o un mensaje informativo si no hay */}
                            {source.relevant_lines &&
                            source.relevant_lines.length > 0 ? (
                              <div className="border-t border-zinc-800/50 px-2 py-1">
                                <div className="text-zinc-400 text-[10px] mb-1">
                                  Información relevante:
                                </div>
                                <div className="space-y-1">
                                  {/* Agrupar líneas por página */}
                                  {(() => {
                                    // Agrupar líneas por página
                                    const linesByPage = {};
                                    source.relevant_lines.forEach((line) => {
                                      // Estimar el número de página (asumiendo 40 líneas por página)
                                      const pageSize = 40;
                                      const estimatedPage =
                                        Math.floor(
                                          line.line_number / pageSize
                                        ) + 1;

                                      if (!linesByPage[estimatedPage]) {
                                        linesByPage[estimatedPage] = [];
                                      }
                                      linesByPage[estimatedPage].push(line);
                                    });

                                    // Renderizar líneas agrupadas por página
                                    return Object.entries(linesByPage).map(
                                      ([page, lines]) => (
                                        <div key={page} className="mb-2">
                                          <div className="text-blue-400 text-[10px] font-medium mb-1">
                                            Página {page}:
                                          </div>
                                          <div className="pl-2 border-l border-zinc-700/30">
                                            {lines.map((line, lineIdx) => (
                                              <div
                                                key={lineIdx}
                                                className="flex text-[10px] mb-1"
                                              >
                                                <span className="text-zinc-500 mr-2 w-6 text-right">
                                                  L{line.line_number % 40 || 40}
                                                  :
                                                </span>
                                                <span className="text-zinc-300 flex-1">
                                                  {line.content}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    );
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="border-t border-zinc-800/50 px-2 py-1">
                                <div className="text-zinc-400 text-[10px] italic">
                                  Documento relevante
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
                  <div className="markdown-content">
                    <ReactMarkdown>
                      {message.summaryContent.length > 300
                        ? message.summaryContent.substring(0, 300) + "..."
                        : message.summaryContent}
                    </ReactMarkdown>
                  </div>
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
      {/* Botón flotante de la mascota con efecto de neón */}
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
                left: "calc(50vw - 32px)",
                right: "auto",
                x: 0,
              }
        }
        transition={{
          duration: 0.2,
          ease: [0.4, 0.0, 0.2, 1],
        }}
      >
        <motion.button
          className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            boxShadow: "0 0 20px rgba(147, 51, 234, 0.3)",
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: "0 0 30px rgba(147, 51, 234, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenChat}
        >
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
            <Bot className="w-8 h-8 drop-shadow-lg" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Panel de chat mejorado */}
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`relative flex h-[85vh] bg-gradient-to-br from-[#0A0A0F] via-[#0A0A0F] to-[#0A0A0F]/95 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800/50 transition-all duration-300 ${
                isContentExpanded ? "w-[90vw] max-w-[1200px]" : "w-[500px]"
              }`}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Efectos de fondo mejorados */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-purple-900/10 to-pink-900/10 opacity-30" />
              <div className="absolute inset-0">
                <div className="absolute top-[10%] left-[15%] w-32 h-32 rounded-full bg-blue-600/10 blur-2xl animate-float opacity-40" />
                <div
                  className="absolute top-[40%] right-[10%] w-24 h-24 rounded-full bg-purple-600/10 blur-2xl animate-float opacity-40"
                  style={{ animationDelay: "1s" }}
                />
                <div
                  className="absolute bottom-[20%] left-[25%] w-28 h-28 rounded-full bg-pink-600/10 blur-2xl animate-float opacity-40"
                  style={{ animationDelay: "2s" }}
                />
              </div>

              {/* Panel de chat principal */}
              <div
                className={`relative flex flex-col ${
                  isContentExpanded
                    ? "w-1/2 border-r border-zinc-800/50"
                    : "w-full"
                }`}
              >
                {/* Cabecera mejorada */}
                <div className="relative flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg">
                      <Bot className="w-6 h-6 text-white drop-shadow" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        Asistente de Estudio
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-zinc-400">Activo</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCloseChat}
                    className="rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Área de mensajes mejorada */}
                <ScrollArea className="relative p-6 z-10 h-[calc(85vh-8rem)]">
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.2 }}
                      >
                        {renderMessage(message, index)}
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        className="flex mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="bg-zinc-800/50 backdrop-blur-sm text-white rounded-2xl rounded-tl-sm px-6 py-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                            <div
                              className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Área de entrada mejorada */}
                <div className="relative p-4 border-t border-zinc-800/80 bg-zinc-900/90 backdrop-blur-sm z-10">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-3"
                  >
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1 bg-zinc-800/50 border-zinc-700 rounded-xl focus-visible:ring-purple-500/50 placeholder:text-zinc-500"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isTyping || !input.trim()}
                      className="rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </div>

              {/* Panel de contenido generado (mantener el resto igual) */}
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

      {/* Mantener los diálogos existentes */}
      {renderFlashcardDialog()}
      {renderSummaryDialog()}
      {renderDetailedSummaryDialog()}
    </>
  );
};

export default memo(PetAgent);
