"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Layers, ChevronRight, Save, CheckSquare, Square } from "lucide-react";
import FlashcardItem from "@/components/flashcards/FlashcardItem";
import { useSession } from "next-auth/react";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

const FlashcardsPreview = React.memo(
  ({
    generatedFlashcards = [],
    collectionId,
    onFlashcardCreated,
    toggleContentPanel,
  }) => {
    const { data: session } = useSession();
    const [flashcardStates, setFlashcardStates] = React.useState({});
    const [selectedFlashcards, setSelectedFlashcards] = useState({});
    const api = useApi();

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

    // Inicializar selecciones cuando cambian las flashcards
    useEffect(() => {
      // Inicializar con todas las flashcards seleccionadas excepto las ya guardadas o rechazadas
      const initialSelections = {};
      generatedFlashcards.forEach(flashcard => {
        const flashcardKey = flashcard.question;
        if (!(flashcardStates[flashcardKey]?.isSaved || flashcardStates[flashcardKey]?.isRejected)) {
          initialSelections[flashcardKey] = true;
        }
      });
      setSelectedFlashcards(initialSelections);
    }, [generatedFlashcards, flashcardStates]);

    const toggleFlashcardSelection = (flashcard) => {
      const flashcardKey = flashcard.question;
      setSelectedFlashcards(prev => ({
        ...prev,
        [flashcardKey]: !prev[flashcardKey]
      }));
    };

    const toggleAllFlashcards = () => {
      // Si todas o la mayoría están seleccionadas, deseleccionar todas
      // De lo contrario, seleccionar todas
      const shouldSelectAll = selectedAvailableCount < availableFlashcards.length / 2;
      
      if (shouldSelectAll) {
        // Seleccionar todas
        const allSelected = {};
        generatedFlashcards.forEach(flashcard => {
          const flashcardKey = flashcard.question;
          // Solo seleccionar las que no están guardadas o rechazadas
          if (!(flashcardStates[flashcardKey]?.isSaved || flashcardStates[flashcardKey]?.isRejected)) {
            allSelected[flashcardKey] = true;
          }
        });
        setSelectedFlashcards(allSelected);
      } else {
        // Deseleccionar todas
        setSelectedFlashcards({});
      }
    };

    const saveSelectedFlashcards = async () => {
      // Verificar que collectionId sea un número válido
      if (!collectionId || isNaN(parseInt(collectionId))) {
        toast.error("ID de colección inválido");
        console.error("ID de colección inválido:", collectionId);
        return;
      }

      // Verificar que el usuario esté autenticado
      if (!session?.user?.email) {
        toast.error("Necesitas iniciar sesión para guardar flashcards");
        console.error("Usuario no autenticado");
        return;
      }

      // Filtrar las flashcards seleccionadas
      const flashcardsToSave = generatedFlashcards.filter(
        flashcard => selectedFlashcards[flashcard.question] && 
        !(flashcardStates[flashcard.question]?.isSaved || flashcardStates[flashcard.question]?.isRejected)
      );

      if (flashcardsToSave.length === 0) {
        toast.info("No hay flashcards seleccionadas para guardar");
        return;
      }

      // Convertir collectionId a número
      const collectionIdNumber = parseInt(collectionId);
      
      // Mostrar toast de inicio
      toast.info(`Guardando ${flashcardsToSave.length} flashcards...`);

      // Marcar todas como "saving"
      flashcardsToSave.forEach(flashcard => {
        updateFlashcardState(flashcard, "saving");
      });

      // Guardar cada flashcard
      const results = await Promise.allSettled(
        flashcardsToSave.map(async (flashcard) => {
          try {
            const flashcardData = {
              question: flashcard.question,
              answer: flashcard.answer,
              difficulty: flashcard.difficulty || 1,
            };

            console.log("Guardando flashcard con datos:", {
              workspaceId: collectionIdNumber, // Esto debería ser el workspaceId, no collectionId
              collectionId: collectionIdNumber,
              flashcardData,
              email: session.user.email
            });

            // Obtener el workspaceId de la colección
            // Como no tenemos acceso directo al workspaceId, usamos el de la URL o un valor predeterminado
            // Esto debería ser mejorado para obtener el workspaceId correcto
            const workspaceId = window.location.pathname.split('/')[2] || 25; // Extraer de la URL o usar 25 como fallback

            // Guardar la flashcard en la base de datos
            await api.flashcards.create(
              workspaceId, // workspaceId
              collectionIdNumber, // collectionId como número
              flashcardData,
              session.user.email
            );
            
            // Marcar como guardada
            updateFlashcardState(flashcard, "saved");
            return flashcard;
          } catch (error) {
            console.error("Error al guardar flashcard:", error);
            updateFlashcardState(flashcard, "error");
            throw error;
          }
        })
      );

      // Contar éxitos y fallos
      const successful = results.filter(result => result.status === "fulfilled").length;
      const failed = results.filter(result => result.status === "rejected").length;

      // Mostrar mensaje de resultado
      if (failed === 0) {
        toast.success(`Se guardaron ${successful} flashcards correctamente`);
      } else if (successful === 0) {
        toast.error(`No se pudo guardar ninguna flashcard`);
      } else {
        toast.warning(`Se guardaron ${successful} flashcards, pero fallaron ${failed}`);
      }

      // Notificar al componente padre
      if (onFlashcardCreated && successful > 0) {
        onFlashcardCreated();
      }

      // Limpiar selecciones
      setSelectedFlashcards({});
    };

    // Calcular flashcards disponibles (no guardadas ni rechazadas)
    const availableFlashcards = generatedFlashcards.filter(flashcard => 
      !(flashcardStates[flashcard.question]?.isSaved || flashcardStates[flashcard.question]?.isRejected)
    );
    
    // Calcular cuántas de las disponibles están seleccionadas
    const selectedAvailableCount = availableFlashcards.filter(flashcard => 
      selectedFlashcards[flashcard.question]
    ).length;
    
    // Calcular cuántas flashcards están seleccionadas en total
    const selectedCount = Object.values(selectedFlashcards).filter(Boolean).length;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <h3 className="font-semibold text-white flex items-center">
            <Layers className="w-5 h-5 mr-2 text-purple-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Flashcards Generadas
            </span>
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAllFlashcards}
              className="text-xs border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {/* Determinar si la mayoría están seleccionadas para mostrar el texto correcto */}
              {availableFlashcards.length > 0 && selectedAvailableCount >= availableFlashcards.length / 2 ? (
                <>
                  <Square className="w-3.5 h-3.5 mr-1" />
                  Deseleccionar todas
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5 mr-1" />
                  Seleccionar todas
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={saveSelectedFlashcards}
              disabled={selectedCount === 0}
              className={`text-xs ${
                selectedCount > 0
                  ? "border-blue-600/50 text-blue-400 hover:bg-blue-900/20 hover:text-blue-300"
                  : "border-zinc-700 text-zinc-500"
              }`}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Guardar ({selectedCount})
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleContentPanel}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800/80"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
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
                  selectMode={true}
                  isSelected={selectedFlashcards[flashcard.question] || false}
                  onToggleSelect={() => toggleFlashcardSelection(flashcard)}
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
