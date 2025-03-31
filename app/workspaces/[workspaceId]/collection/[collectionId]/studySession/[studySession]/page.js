"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  RefreshCw,
  Check,
  X,
  Clock,
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useStudySessionStore } from "@/store/studySession-store/studySession-store";
import { useUserStore } from "@/store/user-store/user-store";
import { useApi } from "@/lib/api";
import PomodoroTimer from "@/components/pomodoro/PomodoroTimer";
import { useSession } from "next-auth/react";

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

  console.log(studySession);
  const api = useApi();

  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [evaluation, setEvaluation] = useState("none");
  const [studyProgress, setStudyProgress] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [completedCards, setCompletedCards] = useState(0);

  useEffect(() => {
    setFlashcards(studySession.flashcards || []);
    setTotalCards(studySession.totalCards || 0);
    setCompletedCards(studySession.completedCards || 0);
    setStudyProgress(studySession.studyProgress || 0);
    setSessionCompleted(studySession.sessionCompleted || false);
  }, [studySession]);

  const handleEvaluation = async (status) => {
    try {
      const studyTimeInSeconds = Math.round(
        (Date.now() - startTimeRef.current) / 1000
      );

      startTimeRef.current = Date.now();

      // Convertir el estado de evaluación a un resultado de revisión
      const reviewResult = {
        flashcardId: flashcards[currentCardIndex].id,
        userId: user.id,
        reviewResult:
          status === "MAL" ? "MAL" : status === "REGULAR" ? "REGULAR" : "BIEN",
        studyTimeInSeconds: studyTimeInSeconds,
      };

      // Enviar la revisión al backend
      await api.flashcards.updateProgress(reviewResult);

      // Incrementar el contador de tarjetas completadas
      setCompletedCards((prev) => prev + 1);

      // Actualizar el progreso basado en las tarjetas completadas
      setStudyProgress(((completedCards + 1) / totalCards) * 100);

      const updatedFlashcards = flashcards.filter(
        (_, index) => index !== currentCardIndex
      );
      setFlashcards(updatedFlashcards);

      setEvaluation("none");
      setIsFlipped(false);

      if (updatedFlashcards.length > 0) {
        const newIndex =
          currentCardIndex >= updatedFlashcards.length
            ? updatedFlashcards.length - 1
            : currentCardIndex;

        setCurrentCardIndex(newIndex);
      } else {
        setSessionCompleted(true);
        await api.studySessions.complete(studySession.id);
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
    }
  };

  const renderEvaluationButtons = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
      transition={{ duration: 0.3 }}
      className="mb-8 flex justify-center space-x-12"
    >
      <Button
        variant="ghost"
        onClick={() => handleEvaluation("MAL")}
        className={`
          relative h-20 w-20 rounded-full transition-all duration-300
          hover:bg-red-500/20 hover:scale-110
          ${!isFlipped ? "pointer-events-none opacity-50" : ""}
        `}
        disabled={!isFlipped}
      >
        <X className="h-12 w-12 text-red-500" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => handleEvaluation("REGULAR")}
        className={`
          relative h-20 w-20 rounded-full transition-all duration-300
          hover:bg-yellow-500/20 hover:scale-110
          ${!isFlipped ? "pointer-events-none opacity-50" : ""}
        `}
        disabled={!isFlipped}
      >
        <Clock className="h-12 w-12 text-yellow-500" />
      </Button>
      <Button
        variant="ghost"
        onClick={() => handleEvaluation("BIEN")}
        className={`
          relative h-20 w-20 rounded-full transition-all duration-300
          hover:bg-green-500/20 hover:scale-110
          ${!isFlipped ? "pointer-events-none opacity-50" : ""}
        `}
        disabled={!isFlipped}
      >
        <Check className="h-12 w-12 text-green-500" />
      </Button>
    </motion.div>
  );

  if (sessionCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-8 dark:bg-[#0A0A0F]"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <Star className="h-16 w-16 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            ¡Sesión Completada!
          </h1>
          <Button
            onClick={() =>
              router.push(
                `/workspaces/${activeWorkspace.id}/collection/${activeCollection.id}`
              )
            }
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center space-x-2"
          >
            <RefreshCw className="h-5 w-5 mr-2" /> Volver a la Colección
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground dark:bg-[#0A0A0F]">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-purple-400" />
          <p className="text-zinc-600 dark:text-zinc-400">
            No hay flashcards disponibles para estudiar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container w-full p-4 max-w-full flex justify-between flex-col h-screen dark:bg-[#0A0A0F]">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-pink-900/5 to-blue-900/3 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-blue-900/5 pointer-events-none" />

      {/* Floating orbs background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/5 dark:bg-pink-600/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 dark:bg-black/50 border-b border-zinc-200/20 dark:border-zinc-800/30">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20 text-zinc-700 dark:text-zinc-300"
                onClick={() =>
                  router.push(
                    `/workspaces/${activeWorkspace.id}/collection/${activeCollection.id}`
                  )
                }
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Sesión de Estudio
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {activeCollection?.name}
                </p>
              </div>
            </div>
            <PomodoroTimer />
          </div>
        </div>
      </div>

      <div className="flex-grow relative">
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 mb-2">
          <Progress
            value={studyProgress}
            className="flex-1 h-3 rounded-full overflow-hidden"
            indicatorclassname="bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500 ease-in-out"
          />
          <span className="text-zinc-500 dark:text-zinc-400 ml-4 text-sm">
            {completedCards} / {totalCards}
          </span>
        </div>

        <div className="flex justify-center items-center h-full relative px-4 mt-8">
          <div className="w-full max-w-[800px] mx-auto">
            <Card
              onClick={() => setIsFlipped(!isFlipped)}
              className={`
                transform-gpu transition-all duration-700
                shadow-2xl cursor-pointer hover:scale-105
                ${isFlipped ? "rotate-y-180" : ""}
                bg-gradient-to-br from-white/80 to-zinc-50/80 dark:from-zinc-900/80 dark:to-zinc-950/80
                backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50
              `}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                {!isFlipped ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center w-full"
                  >
                    <Target className="h-16 w-16 mx-auto mb-6 text-purple-400 animate-pulse" />
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                      {flashcards[currentCardIndex].question}
                    </h2>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                      Click para ver la respuesta
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center w-full rotate-y-180"
                  >
                    <Zap className="h-16 w-16 mx-auto mb-6 text-pink-400" />
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                      {flashcards[currentCardIndex].answer}
                    </h2>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {renderEvaluationButtons()}

      <div className="flex justify-center space-x-6 mt-4 mb-8">
        <Button
          variant="outline"
          disabled={currentCardIndex === 0}
          onClick={() => {
            setCurrentCardIndex((prev) => Math.max(0, prev - 1));
            setIsFlipped(false);
          }}
          className="border-zinc-200 dark:border-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105 transition-all duration-300 px-6 py-2 text-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Anterior
        </Button>
        <Button
          variant="outline"
          disabled={currentCardIndex === flashcards.length - 1}
          onClick={() => {
            setCurrentCardIndex((prev) =>
              Math.min(flashcards.length - 1, prev + 1)
            );
            setIsFlipped(false);
          }}
          className="border-zinc-200 dark:border-zinc-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-pink-300 hover:scale-105 transition-all duration-300 px-6 py-2 text-lg"
        >
          Siguiente <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
