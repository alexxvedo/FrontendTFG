"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApi } from "@/lib/api";

const FlashcardItem = ({ 
  flashcard, 
  index, 
  state, 
  onStateChange, 
  collectionId, 
  userEmail,
  onFlashcardCreated 
}) => {
  const api = useApi();
  
  // Obtener el estado actual de esta flashcard
  const currentState = state || {};

  const handleSaveFlashcard = async () => {
    try {
      // Evitar guardar si ya está guardada o rechazada
      if (currentState.isSaved || currentState.isRejected) {
        return;
      }

      // Actualizar estado a "guardando"
      onStateChange(flashcard, "saving");

      // Crear la flashcard en la base de datos
      const flashcardData = {
        question: flashcard.question,
        answer: flashcard.answer,
        difficulty: flashcard.difficulty || 1,
      };

      if (!userEmail) {
        throw new Error("Usuario no autenticado");
      }

      // Guardar la flashcard en la base de datos
      await api.flashcards.create(collectionId, flashcardData, userEmail);

      // Marcar como guardada
      onStateChange(flashcard, "saved");

      // Notificar al componente padre si existe la función
      if (onFlashcardCreated) {
        onFlashcardCreated(flashcard);
      }

      toast.success("Flashcard guardada correctamente");
    } catch (error) {
      console.error("Error al guardar flashcard:", error);
      // Restablecer el estado en caso de error
      onStateChange(flashcard, "error");
      toast.error(
        "No se pudo guardar la flashcard: " +
          (error.message || "Error desconocido")
      );
    }
  };

  const handleRejectFlashcard = () => {
    // Evitar rechazar si ya está guardada o rechazada
    if (currentState.isSaved || currentState.isRejected) {
      return;
    }

    // Marcar como rechazada
    onStateChange(flashcard, "rejected");
    toast.info("Flashcard descartada");
  };

  return (
    <div
      className={`bg-zinc-900/80 border ${
        currentState.isSaved
          ? "border-green-600/50"
          : currentState.isRejected
          ? "border-red-600/50"
          : "border-zinc-800"
      } rounded-lg p-4 hover:bg-gradient-to-br hover:from-zinc-900/90 hover:to-zinc-800/50 transition-all duration-300 shadow-lg`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-white">Pregunta {index + 1}</h4>
        <div className="text-xs text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded-full">
          Dificultad: {flashcard.difficulty || 1}
        </div>
      </div>
      <p className="text-zinc-300 mb-4">{flashcard.question}</p>
      <div className="border-t border-zinc-800 pt-3 mt-2">
        <h4 className="font-medium text-white mb-2">Respuesta</h4>
        <p className="text-zinc-400 mb-3">{flashcard.answer}</p>
        {flashcard.topic && (
          <div className="text-xs text-zinc-400 bg-zinc-800/80 inline-block px-2 py-1 rounded-full mb-3">
            Tema: {flashcard.topic}
          </div>
        )}
      </div>

      {!currentState.isSaved && !currentState.isRejected ? (
        <div className="flex justify-end space-x-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRejectFlashcard}
            disabled={currentState.isSaved}
            className="border-red-700/50 hover:bg-red-900/20 text-red-400 transition-all duration-300"
          >
            Rechazar
          </Button>
          <Button
            size="sm"
            onClick={handleSaveFlashcard}
            disabled={
              currentState.status === "saving" ||
              currentState.isSaved ||
              currentState.isRejected
            }
            className={`transition-all duration-300 ${
              currentState.status === "saving"
                ? "bg-zinc-700 text-zinc-300"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            }`}
          >
            {currentState.status === "saving" ? (
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
              "Guardar"
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-3 text-sm flex items-center justify-center">
          {currentState.isSaved ? (
            <span className="text-green-400 flex items-center justify-center bg-green-900/20 px-3 py-2 rounded-md">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Flashcard guardada
            </span>
          ) : (
            <span className="text-red-400 flex items-center justify-center bg-red-900/20 px-3 py-2 rounded-md">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Flashcard descartada
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardItem;
