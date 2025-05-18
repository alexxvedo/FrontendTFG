"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  RefreshCw,
  Check,
  X,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useStudySessionStore } from "@/store/studySession-store/studySession-store";
import { useApi } from "@/lib/api";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// Importar ReactQuill de forma dinámica para evitar errores de SSR
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <p className="text-center text-zinc-500 dark:text-zinc-400">
      Cargando editor...
    </p>
  ),
});

export default function StudySession({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const activeCollection = useCollectionStore(
    (state) => state.activeCollection
  );
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const studySession = useStudySessionStore((state) => state.studySession);
  const startTimeRef = useRef(Date.now());

  const api = useApi();

  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyProgress, setStudyProgress] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [completedCards, setCompletedCards] = useState(0);
  const [isCardAnimating, setIsCardAnimating] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const [flashcardStatuses, setFlashcardStatuses] = useState([]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    // Importar estilos de Quill solo en el cliente
    const loadStyles = async () => {
      try {
        await import("react-quill/dist/quill.bubble.css");
        setStylesLoaded(true);
      } catch (error) {
        console.error("Error loading styles:", error);
      }
    };

    loadStyles();

    if (studySession) {
      const cards = studySession.flashcards || [];
      setFlashcards(cards);
      setTotalCards(cards.length || 0);
      setCompletedCards(studySession.completedCards || 0);
      setStudyProgress(studySession.studyProgress || 0);
      setSessionCompleted(studySession.sessionCompleted || false);

      // Inicializar el estado de cada flashcard como "pendiente"
      setFlashcardStatuses(
        cards.map((card, index) => ({
          id: card.id,
          status: "pending", // pending, wrong, medium, correct
          position: "queue", // queue (en cola), review (para revisar), completed (completada)
          originalIndex: index, // Mantener el índice original para referencia
        }))
      );
    }
  }, [studySession]);

  useEffect(() => {
    if (flashcards.length > 0 && flashcardStatuses.length > 0) {
      // Crear un nuevo array de estados ordenado según el orden actual de flashcards
      const newOrderedStatuses = flashcards.map((card) => {
        const status = flashcardStatuses.find((s) => s.id === card.id);
        return (
          status || {
            id: card.id,
            status: "pending",
            position: "queue",
            originalIndex: 0,
          }
        );
      });

      // Añadir las tarjetas completadas al final (que ya no están en flashcards)
      const completedCards = flashcardStatuses.filter(
        (status) =>
          status.position === "completed" &&
          !flashcards.some((card) => card.id === status.id)
      );

      setFlashcardStatuses([...newOrderedStatuses, ...completedCards]);
    }
  }, [flashcards]);

  const handleEvaluation = async (status) => {
    if (!flashcards || flashcards.length === 0 || !user) return;

    try {
      setIsCardAnimating(true);
      setIsReordering(true); // Iniciar animación de reordenamiento

      const studyTimeInSeconds = Math.round(
        (Date.now() - startTimeRef.current) / 1000
      );

      startTimeRef.current = Date.now();

      // Convertir el estado de evaluación a un resultado de revisión
      const reviewResult = {
        flashcardId: flashcards[currentCardIndex]?.id,
        userId: user.id,
        reviewResult: status,
        studyTimeInSeconds: studyTimeInSeconds,
      };

      // Enviar la revisión al backend
      await api.flashcards.updateProgress(reviewResult);

      // Incrementar el contador de tarjetas completadas
      setCompletedCards((prev) => prev + 1);

      // Actualizar el progreso basado en las tarjetas completadas
      setStudyProgress(((completedCards + 1) / totalCards) * 100);

      // Obtener la tarjeta actual
      const currentCard = flashcards[currentCardIndex];

      // Crear una copia de las flashcards para reorganizarlas
      let updatedFlashcards = [...flashcards];

      // Eliminar la tarjeta actual de su posición
      updatedFlashcards.splice(currentCardIndex, 1);

      // Actualizar el estado de la tarjeta según la evaluación
      const updatedStatuses = [...flashcardStatuses];
      const statusIndex = updatedStatuses.findIndex(
        (s) => s.id === currentCard.id
      );

      if (statusIndex !== -1) {
        let newStatus;
        let newPosition;

        switch (status) {
          case "MAL":
            newStatus = "wrong";
            newPosition = "review";
            // Colocar la tarjeta después de la siguiente tarjeta (no inmediatamente)
            if (currentCardIndex + 1 < updatedFlashcards.length) {
              updatedFlashcards.splice(currentCardIndex + 2, 0, currentCard);
            } else {
              // Si es la última tarjeta, colocarla al final
              updatedFlashcards.push(currentCard);
            }
            break;
          case "REGULAR":
            newStatus = "medium";
            newPosition = "review";
            // Colocar la tarjeta al final para repasarla más tarde
            updatedFlashcards.push(currentCard);
            break;
          case "BIEN":
            newStatus = "correct";
            newPosition = "completed";
            // La tarjeta ya no se repasará en esta sesión
            break;
        }

        updatedStatuses[statusIndex] = {
          ...updatedStatuses[statusIndex],
          status: newStatus,
          position: newPosition,
        };

        setFlashcardStatuses(updatedStatuses);
      }

      setTimeout(() => {
        setFlashcards(updatedFlashcards);
        setIsFlipped(false);
        setIsCardAnimating(false);

        // Terminar la animación de reordenamiento después de un tiempo
        setTimeout(() => {
          setIsReordering(false);
        }, 500);

        if (updatedFlashcards.length > 0) {
          const newIndex =
            currentCardIndex >= updatedFlashcards.length
              ? updatedFlashcards.length - 1
              : currentCardIndex;

          setCurrentCardIndex(newIndex);
        } else {
          setSessionCompleted(true);
          if (studySession?.id) {
            api.studySessions.complete(studySession.id);
          }
        }
      }, 300);
    } catch (error) {
      console.error("Error updating flashcard:", error);
      setIsCardAnimating(false);
      setIsReordering(false);
    }
  };

  // Componente de sesión completada
  if (sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>

        <div className="relative z-10 bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-zinc-800/30 p-12 rounded-2xl shadow-xl max-w-md text-center">
          <div className="flex justify-center mb-6">
            <Trophy className="h-20 w-20 text-yellow-400" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            ¡Sesión Completada!
          </h1>

          <p className="text-gray-600 dark:text-zinc-400 mb-8">
            Has completado todas las tarjetas de esta sesión. ¡Sigue así para
            mejorar tu aprendizaje!
          </p>

          <Button
            onClick={() =>
              router.push(
                `/workspaces/${activeWorkspace?.id}/collection/${activeCollection?.id}`
              )
            }
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <RefreshCw className="h-5 w-5 mr-2" /> Volver a la Colección
          </Button>
        </div>
      </div>
    );
  }

  // Componente de no hay flashcards
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>

        <div className="text-center bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-zinc-800/30 p-8 rounded-2xl shadow-xl relative z-10">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-purple-400" />
          <p className="text-gray-600 dark:text-zinc-400">
            No hay flashcards disponibles para estudiar
          </p>
        </div>
      </div>
    );
  }

  // Componente principal de estudio
  return (
    <div className="w-full p-4 flex flex-col h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white pb-12">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20"></div>

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-sm bg-white/60 dark:bg-black/30 border-b border-gray-200 dark:border-zinc-800/30 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/30 text-gray-700 dark:text-zinc-300"
              onClick={() =>
                router.push(
                  `/workspaces/${activeWorkspace?.id}/collection/${activeCollection?.id}`
                )
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                Sesión de Estudio
              </h1>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {activeCollection?.name}
              </p>
            </div>
          </div>
          <PomodoroTimer />
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-grow relative">
        <div className="absolute top-0 left-0 right-0 px-4 mb-2 pt-4">
          {/* Nueva barra de progreso con indicadores de tarjetas */}
          <div className="w-full flex items-center justify-center mb-4">
            <div className="w-full max-w-3xl flex items-center space-x-1 overflow-hidden">
              {flashcardStatuses.map((card, index) => {
                let bgColor = "bg-zinc-700"; // Pendiente (gris oscuro)

                if (card.status === "wrong") {
                  bgColor = "bg-red-500"; // Fallada (rojo)
                } else if (card.status === "medium") {
                  bgColor = "bg-yellow-500"; // Medio (amarillo)
                } else if (card.status === "correct") {
                  bgColor = "bg-green-500"; // Correcta (verde)
                }

                // Resaltar la tarjeta actual
                const isCurrentCard =
                  flashcards[currentCardIndex]?.id === card.id;
                const borderClass = isCurrentCard
                  ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-[#0A0A0F]"
                  : "";

                // Añadir clases de animación para el reordenamiento
                const animationClass = isReordering
                  ? "transition-all duration-700 ease-in-out"
                  : "";

                return (
                  <div
                    key={card.id}
                    className={`h-2 flex-1 rounded-full ${bgColor} ${borderClass} ${animationClass}`}
                    title={`Tarjeta ${index + 1}: ${
                      card.status === "pending"
                        ? "Pendiente"
                        : card.status === "wrong"
                        ? "Difícil"
                        : card.status === "medium"
                        ? "Medio"
                        : "Fácil"
                    }`}
                    style={{
                      order: index, // Usar order de flexbox para reordenar visualmente
                      minWidth: "8px", // Asegurar un ancho mínimo visible
                      maxWidth: "none", // Todas las tarjetas tienen el mismo tamaño máximo
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">
              {completedCards} / {totalCards}
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs text-zinc-400">Difícil</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                <span className="text-xs text-zinc-400">Medio</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs text-zinc-400">Fácil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center items-center h-full relative px-4 mt-8">
          <div className="w-full max-w-[800px] mx-auto">
            <div
              onClick={() => !isCardAnimating && setIsFlipped(!isFlipped)}
              className="transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-purple-500/10 hover:scale-[1.02] bg-white/5 dark:bg-white/10 backdrop-blur-sm border border-zinc-800/30 rounded-2xl overflow-hidden"
            >
              <div className="p-8 flex flex-col justify-center min-h-[400px] relative">
                {/* Indicador de lado de la tarjeta */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ">
                  {!isFlipped ? "Pregunta" : "Respuesta"}
                </div>

                {!isFlipped ? (
                  <>
                    <div
                      className="text-center flex items-center justify-center"
                      style={{ minHeight: "200px" }}
                    >
                      {stylesLoaded &&
                        typeof window !== "undefined" &&
                        flashcards.length > 0 && (
                          <div className="quill-content text-3xl text-gray-800 dark:text-zinc-100">
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  flashcards[currentCardIndex]?.question || "",
                              }}
                            />
                          </div>
                        )}
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <p className="text-sm text-zinc-400 flex items-center justify-center">
                        <span className="mr-2">
                          Click para ver la respuesta
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="text-center flex items-center justify-center"
                      style={{ minHeight: "200px" }}
                    >
                      {stylesLoaded &&
                        typeof window !== "undefined" &&
                        flashcards.length > 0 && (
                          <div className="quill-content text-2xl text-gray-800 dark:text-zinc-100">
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  flashcards[currentCardIndex]?.answer || "",
                              }}
                            />
                          </div>
                        )}
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <p className="text-sm text-zinc-400">
                        Evalúa tu conocimiento usando los botones de abajo
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation buttons */}
      <div className="mb-8 flex justify-center space-x-12 ">
        <Button
          variant="ghost"
          onClick={() => handleEvaluation("MAL")}
          className="relative h-20 w-20 rounded-full transition-all duration-300 hover:bg-red-500/20 hover:scale-110"
          disabled={!isFlipped || isCardAnimating}
        >
          <X className="h-12 w-12 text-red-500" />
          <span className="absolute -bottom-6 text-xs font-medium text-red-500">
            Difícil
          </span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleEvaluation("REGULAR")}
          className="relative h-20 w-20 rounded-full transition-all duration-300 hover:bg-yellow-500/20 hover:scale-110"
          disabled={!isFlipped || isCardAnimating}
        >
          <Clock className="h-12 w-12 text-yellow-500" />
          <span className="absolute -bottom-6 text-xs font-medium text-yellow-500">
            Medio
          </span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleEvaluation("BIEN")}
          className="relative h-20 w-20 rounded-full transition-all duration-300 hover:bg-green-500/20 hover:scale-110"
          disabled={!isFlipped || isCardAnimating}
        >
          <Check className="h-12 w-12 text-green-500" />
          <span className="absolute -bottom-6 text-xs font-medium text-green-500">
            Fácil
          </span>
        </Button>
      </div>
    </div>
  );
}
