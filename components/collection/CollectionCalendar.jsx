"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Play, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Utilidad para convertir fechas en array o string a objeto Date
function parseDate(date) {
  if (!date) return null;

  if (Array.isArray(date)) {
    console.log("Raw date array:", date);

    // Intentar diferentes interpretaciones del array
    if (date.length >= 3) {
      const [year, month, day] = date;

      // El backend ya envía los meses en formato 0-11 (JavaScript)
      let jsMonth = month - 1; // Convertir de 1-12 (Java) a 0-11 (JavaScript)

      // Crear la fecha básica
      let jsDate = new Date(year, jsMonth, day);

      // Si hay más valores, intentar añadir tiempo
      if (date.length >= 6) {
        const hour = date[3];
        const minute = date[4];
        const second = date[5];
        jsDate = new Date(year, jsMonth, day, hour, minute, second);
      }

      // Si hay 7 valores, el último son nanosegundos, no milisegundos
      if (date.length >= 7) {
        const hour = date[3];
        const minute = date[4];
        const second = date[5];
        // Convertir nanosegundos a milisegundos
        jsDate = new Date(year, jsMonth, day, hour, minute);
      }

      console.log(
        `Date conversion: [${date.join(", ")}] -> ${jsDate.toISOString()}`
      );

      // Verificar que la fecha es válida
      if (isNaN(jsDate.getTime())) {
        console.warn("Invalid date created from array:", date, "->", jsDate);
        return null;
      }

      return jsDate;
    }

    console.warn("Invalid date array format:", date);
    return null;
  }

  if (typeof date === "string") {
    const jsDate = new Date(date);
    if (isNaN(jsDate.getTime())) {
      console.warn("Invalid date string:", date);
      return null;
    }
    return jsDate;
  }

  return null;
}

export default function CollectionCalendar({
  collection,
  user,
  workspaceId,
  collectionId,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateFlashcards, setSelectedDateFlashcards] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generar calendario para el mes actual
  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || calendar.length < 42) {
      calendar.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  };

  // Procesar las flashcards ya cargadas para agruparlas por fecha de revisión
  useEffect(() => {
    setIsLoading(true);
    const flashcardsByDate = {};

    console.log(
      "Processing flashcards for calendar:",
      collection?.flashcards?.length || 0
    );

    if (collection?.flashcards && Array.isArray(collection.flashcards)) {
      collection.flashcards.forEach((flashcard, index) => {
        console.log(`Flashcard ${index + 1}:`, {
          id: flashcard.id,
          question: flashcard.question?.substring(0, 50) + "...",
          nextReviewDate: flashcard.nextReviewDate,
          lastReviewedAt: flashcard.lastReviewedAt,
        });

        // Usar directamente las propiedades de la flashcard
        const nextReviewDate = parseDate(flashcard.nextReviewDate);

        if (nextReviewDate) {
          // Agrupar por fecha local (no UTC)
          const dateKey =
            nextReviewDate.getFullYear() +
            "-" +
            String(nextReviewDate.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(nextReviewDate.getDate()).padStart(2, "0");
          console.log(`Flashcard ${flashcard.id} scheduled for:`, dateKey);

          if (!flashcardsByDate[dateKey]) {
            flashcardsByDate[dateKey] = [];
          }

          const flashcardWithProgress = {
            ...flashcard,
            nextReviewDate,
            lastReviewedAt: parseDate(flashcard.lastReviewedAt),
          };

          flashcardsByDate[dateKey].push(flashcardWithProgress);
        } else {
          console.log(`Flashcard ${flashcard.id} has no valid nextReviewDate`);
        }
      });
    }

    console.log("Final calendar data:", flashcardsByDate);
    setCalendarData(flashcardsByDate);
    setIsLoading(false);
  }, [collection?.flashcards, user?.email, currentDate]);

  const calendar = generateCalendar(currentDate);

  const handleDateClick = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    const flashcardsForDate = calendarData[dateKey] || [];
    setSelectedDate(date);
    setSelectedDateFlashcards(flashcardsForDate);
    setIsDialogOpen(true);
  };

  const handleStartStudy = () => {
    if (selectedDateFlashcards.length > 0) {
      toast.success(
        `Iniciando sesión de estudio con ${selectedDateFlashcards.length} flashcards...`
      );
      // Aquí podrías navegar a una página de estudio o abrir un modal de estudio
    }
    setIsDialogOpen(false);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getFlashcardCount = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    return calendarData[dateKey]?.length || 0;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Calendario de Repaso
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[200px] text-center">
            {currentDate.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Días de la semana */}
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-3 text-center font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {day}
            </div>
          ))}

          {/* Días del calendario */}
          {calendar.map((date, index) => {
            const flashcardCount = getFlashcardCount(date);
            const hasFlashcards = flashcardCount > 0;
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  p-3 min-h-[80px] border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200
                  ${
                    isToday(date)
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }
                  ${
                    !isCurrentMonth(date)
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-gray-900 dark:text-white"
                  }
                  ${
                    hasFlashcards
                      ? "ring-2 ring-purple-200 dark:ring-purple-800 hover:ring-purple-300 dark:hover:ring-purple-700"
                      : ""
                  }
                `}
              >
                <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                {hasFlashcards && (
                  <div className="flex items-center justify-center">
                    <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {flashcardCount}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded"></div>
          <span>Hoy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
          <span>Flashcards para revisar</span>
        </div>
      </div>

      {/* Diálogo para mostrar flashcards de una fecha específica */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>
                Flashcards para revisar -{" "}
                {selectedDate && formatDate(selectedDate)}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDateFlashcards.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay flashcards programadas para revisar en esta fecha.</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDateFlashcards.length} flashcard
                  {selectedDateFlashcards.length !== 1 ? "s" : ""} para revisar
                </div>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {selectedDateFlashcards.map((flashcard, index) => (
                    <Card
                      key={index}
                      className="border-l-4 border-l-purple-500"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Pregunta {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {flashcard.question}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Última revisión:{" "}
                          {flashcard.lastReviewedAt
                            ? new Date(
                                flashcard.lastReviewedAt
                              ).toLocaleDateString("es-ES")
                            : "Nunca"}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={handleStartStudy}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar estudio
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
