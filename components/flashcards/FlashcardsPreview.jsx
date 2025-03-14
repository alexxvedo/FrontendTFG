"use client";

import React, { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Layers, ChevronRight } from "lucide-react";
import FlashcardItem from "@/components/flashcards/FlashcardItem";
import { useSession } from "next-auth/react";

const FlashcardsPreview = React.memo(
  ({
    generatedFlashcards = [],
    collectionId,
    onFlashcardCreated,
    toggleContentPanel,
  }) => {
    const { data: session } = useSession();
    const [flashcardStates, setFlashcardStates] = React.useState({});

    // Usar useEffect para mantener el estado de las flashcards guardadas
    useEffect(() => {
      // Mantener el estado de las flashcards guardadas incluso si el componente se re-renderiza
      const savedFlashcardsFromStorage = localStorage.getItem(
        `flashcardStates-${collectionId}`
      );
      if (savedFlashcardsFromStorage) {
        try {
          const parsedStates = JSON.parse(savedFlashcardsFromStorage);
          setFlashcardStates(parsedStates);
        } catch (error) {
          console.error("Error parsing flashcard states:", error);
        }
      }
    }, [collectionId]);

    const updateFlashcardState = useCallback(
      (flashcard, status) => {
        const flashcardKey = flashcard.question;
        const isSaving = status === "saving";

        setFlashcardStates((prev) => {
          const newState = {
            ...prev,
            [flashcardKey]: {
              ...prev[flashcardKey],
              status: isSaving ? "saving" : status,
              isSaved: status === "saved",
              isRejected: status === "rejected",
            },
          };

          // Guardar en localStorage para persistencia
          localStorage.setItem(
            `flashcardStates-${collectionId}`,
            JSON.stringify(newState)
          );

          return newState;
        });
      },
      [collectionId]
    );

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <h3 className="font-semibold text-white flex items-center">
            <Layers className="w-5 h-5 mr-2 text-purple-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Flashcards Generadas
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
            {generatedFlashcards.length > 0 ? (
              generatedFlashcards.map((flashcard, index) => (
                <FlashcardItem
                  key={`flashcard-item-${index}`}
                  flashcard={flashcard}
                  index={index}
                  state={flashcardStates[flashcard.question]}
                  onStateChange={updateFlashcardState}
                  collectionId={collectionId}
                  userEmail={session?.user?.email}
                  onFlashcardCreated={onFlashcardCreated}
                />
              ))
            ) : (
              <div className="text-center text-zinc-500 py-8">
                No hay flashcards generadas
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FlashcardsPreview.displayName = "FlashcardsPreview";

export default FlashcardsPreview;
