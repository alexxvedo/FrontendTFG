"use client";
import { useState, useCallback, useEffect } from "react";
import { useApi } from "@/lib/api";

export default function CollectionStats({ collection }) {
  const [flashcardsStats, setFlashcardsStats] = useState({
    // Estadísticas de creación
    creadasHoy: 0,
    creadasUltimos7Dias: 0,
    creadasUltimos30Dias: 0,
    totalCreadas: 0,

    // Estadísticas de revisión
    revisadasHoy: 0,
    revisadasUltimos7Dias: 0,
    revisadasUltimos30Dias: 0,
    totalRevisadas: 0,

    // Estadísticas de estado y conocimiento
    estadosPorStatus: [],
    estadosPorConocimiento: [],

    // Estadísticas de rendimiento
    porcentajeCompletadas: 0,
    porcentajeExito: 0,
    tiempoMedioRevision: 0,

    // Rachas y logros
    rachaActual: 0,
    rachaMasLarga: 0,
    diasTotalesEstudio: 0,

    // Estadísticas adicionales
    dueForReview: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const api = useApi();

  const fetchFlashcardsStats = useCallback(
    async (collectionId) => {
      try {
        setLoading(true);
        const data = await api.flashcards.getStats(collectionId);
        setFlashcardsStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    },
    [collection.id]
  );

  useEffect(() => {
    if (collection?.id) {
      fetchFlashcardsStats(collection.id);
    }
  }, [collection?.id, fetchFlashcardsStats]);

  // Get estados (status counts) for display
  const estados = flashcardsStats.estadosPorStatus || [];

  // Get niveles de conocimiento (knowledge levels) for display
  const nivelesConocimiento = flashcardsStats.estadosPorConocimiento || [];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-zinc-900/50 dark:to-zinc-900/30 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-8 shadow-xl shadow-purple-500/5">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="min-w-full">
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-6">
              {/* Actividad Reciente */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50/80 via-fuchsia-50/80 to-pink-50/80 dark:from-purple-950/30 dark:via-fuchsia-950/30 dark:to-pink-950/30 p-6 border border-purple-100/50 dark:border-purple-900/50 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                      Actividad Reciente
                    </h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                        Creadas hoy
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                          {flashcardsStats.creadasHoy || 0}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          flashcards
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                        Últimos 7 días
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                          {flashcardsStats.creadasUltimos7Dias || 0}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          flashcards
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                        Últimos 30 días
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                          {flashcardsStats.creadasUltimos30Dias || 0}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          flashcards
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado General */}
              <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 p-6 border border-purple-100/50 dark:border-purple-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-full bg-purple-500/10 p-2.5 transition-all duration-300 group-hover:bg-purple-500/20 group-hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-purple-500 transition-all duration-300 group-hover:rotate-12"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M21 3v5h-5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-purple-500 after:to-fuchsia-500 after:transition-all after:duration-300 group-hover:after:w-full">
                    Estado General
                  </h3>
                </div>
                <div className="space-y-6">
                  {estados.map((estado) => (
                    <div key={estado.status}>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                        {estado.status === "SIN_HACER"
                          ? "Por hacer"
                          : estado.status === "REVISAR"
                          ? "Para revisar"
                          : "Completadas"}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                          {estado.count}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          flashcards ({Math.round(estado.porcentaje)}
                          %)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progreso */}
              <div className="group rounded-2xl bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 p-6 border border-fuchsia-100/50 dark:border-fuchsia-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/10 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-full bg-fuchsia-500/10 p-2.5 transition-all duration-300 group-hover:bg-fuchsia-500/20 group-hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-fuchsia-500 transition-all duration-300 group-hover:rotate-12"
                    >
                      <path d="M12 20v-6" />
                      <path d="M12 14v-6" />
                      <path d="M12 8V2" />
                      <path d="M3 20c0-3.87 3.13-7 7-7" />
                      <path d="M14 13c3.87 0 7 3.13 7 7" />
                      <path d="M3 12c0-3.87 3.13-7 7-7" />
                      <path d="M14 5c3.87 0 7 3.13 7 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-fuchsia-500 after:to-pink-500 after:transition-all after:duration-300 group-hover:after:w-full">
                    Nivel de Conocimiento
                  </h3>
                </div>
                <div className="space-y-6">
                  {nivelesConocimiento.map((nivel) => (
                    <div key={nivel.knowledgeLevel || "null"}>
                      <p className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 mb-1">
                        {nivel.knowledgeLevel === "BAD"
                          ? "Necesita repaso"
                          : nivel.knowledgeLevel === "REGULAR"
                          ? "En progreso"
                          : nivel.knowledgeLevel === "GOOD"
                          ? "Dominadas"
                          : "Sin clasificar"}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                          {nivel.count}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          flashcards ({Math.round(nivel.porcentaje)}
                          %)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-3 gap-6">
              {/* Revisiones */}
              <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 p-6 border border-purple-100/50 dark:border-purple-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-full bg-purple-500/10 p-2.5 transition-all duration-300 group-hover:bg-purple-500/20 group-hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-purple-500 transition-all duration-300 group-hover:rotate-12"
                    >
                      <path d="M3 2v6h6" />
                      <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-purple-500 after:to-fuchsia-500 after:transition-all after:duration-300 group-hover:after:w-full">
                    Revisiones
                  </h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      Revisadas hoy
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {flashcardsStats.revisadasHoy || 0}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        flashcards
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      Últimos 7 días
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {flashcardsStats.revisadasUltimos7Dias || 0}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        flashcards
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      Últimos 30 días
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {flashcardsStats.revisadasUltimos30Dias || 0}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        flashcards
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                      Total revisadas
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {flashcardsStats.totalRevisadas || 0}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        flashcards
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rendimiento */}
              <div className="group rounded-2xl bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 p-6 border border-fuchsia-100/50 dark:border-fuchsia-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-fuchsia-500/10 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-full bg-fuchsia-500/10 p-2.5 transition-all duration-300 group-hover:bg-fuchsia-500/20 group-hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-fuchsia-500 transition-all duration-300 group-hover:rotate-12"
                    >
                      <path d="m12 14 4-4" />
                      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-fuchsia-500 after:to-pink-500 after:transition-all after:duration-300 group-hover:after:w-full">
                    Rendimiento
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="transform transition-all duration-300 hover:-translate-y-1">
                    <p className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 mb-1">
                      Porcentaje de éxito
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 relative">
                        {Math.round(
                          flashcardsStats.successRate ||
                            flashcardsStats.porcentajeExito ||
                            0
                        )}
                        <span className="text-2xl text-fuchsia-500">%</span>
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        de aciertos
                      </p>
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 hover:-translate-y-1">
                    <p className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 mb-1">
                      Racha de estudio
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {flashcardsStats.rachaActual || 0}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        días seguidos
                      </p>
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 hover:-translate-y-1">
                    <p className="text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 mb-1">
                      Mejor racha
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {flashcardsStats.rachaMasLarga || 0}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        días seguidos
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiempo de Estudio */}
              <div className="group rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-6 border border-pink-100/50 dark:border-pink-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-full bg-pink-500/10 p-2.5 transition-all duration-300 group-hover:bg-pink-500/20 group-hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-pink-500 transition-all duration-300 group-hover:rotate-12"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-pink-500 after:to-rose-500 after:transition-all after:duration-300 group-hover:after:w-full">
                    Tiempo de Estudio
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="transform transition-all duration-300 hover:-translate-y-1">
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">
                      Tiempo medio
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {Math.round(flashcardsStats.tiempoMedioRevision || 0)}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        segundos por tarjeta
                      </p>
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 hover:-translate-y-1">
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">
                      Días de estudio
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {flashcardsStats.diasTotalesEstudio || 0}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        días en total
                      </p>
                    </div>
                  </div>
                  <div className="transform transition-all duration-300 hover:-translate-y-1">
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">
                      Tarjetas pendientes
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {flashcardsStats.dueForReview || 0}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        para revisar hoy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
