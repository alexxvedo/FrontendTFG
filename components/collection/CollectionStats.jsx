"use client";
import { useState } from "react";
import { useUserStore } from "@/store/user-store/user-store";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Award,
  BookOpen,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock4,
  Flame,
  Timer,
} from "lucide-react";

export default function CollectionStats({ collection }) {
  // Obtener el usuario actual del store
  const user = useUserStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  // IMPORTANTE: Este componente solo debe mostrar estadísticas, no crear registros de progreso

  // Calcular el número total de flashcards
  const totalFlashcards = collection?.flashcards?.length || 0;

  // Calculate percentages for progress bars
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  };

  // Calcular estadísticas basadas en user_flashcard_progress y flashcard_activity
  const calculateAdvancedStats = () => {
    if (!collection?.flashcards || collection.flashcards.length === 0) {
      return {
        // Actividad reciente
        reviewedToday: 0,
        reviewedLast7Days: 0,
        reviewedLast30Days: 0,

        // Estado de las tarjetas
        newFlashcards: 0,
        dueForReview: 0,
        completed: 0,
        newPercentage: 0,
        reviewPercentage: 0,
        completedPercentage: 0,

        // Nivel de conocimiento
        masterCount: 0,
        learningCount: 0,
        needReviewCount: 0,
        unclassifiedCount: 0,
        masterPercentage: 0,
        learningPercentage: 0,
        needReviewPercentage: 0,
        unclassifiedPercentage: 0,

        // Revisiones y rendimiento
        totalReviews: 0,
        avgTimePerCard: 0,
        successRate: 0,
        studyDays: 0,
      };
    }

    console.log(
      "Flashcards en las estadisticas avanzadas: ",
      collection.flashcards
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Actividad reciente (basada en lastReviewedAt de userFlashcardProgress)
    const reviewedToday = collection.flashcards.filter((card) => {
      const lastReviewed = card.lastReviewedAt
        ? new Date(card.lastReviewedAt)
        : null;
      return lastReviewed && lastReviewed >= today;
    }).length;

    const reviewedLast7Days = collection.flashcards.filter((card) => {
      const lastReviewed = card.lastReviewedAt
        ? new Date(card.lastReviewedAt)
        : null;
      return lastReviewed && lastReviewed >= sevenDaysAgo;
    }).length;

    const reviewedLast30Days = collection.flashcards.filter((card) => {
      const lastReviewed = card.lastReviewedAt
        ? new Date(card.lastReviewedAt)
        : null;
      return lastReviewed && lastReviewed >= thirtyDaysAgo;
    }).length;

    // Estado de las tarjetas
    // Sin hacer: no tienen user_flashcard_progress o está vacío
    const newFlashcards = collection.flashcards.filter(
      (card) => card.status === "sinHacer"
    ).length;

    // Por revisar: nextReviewDate es hoy o anterior
    const dueForReview = collection.flashcards.filter(
      (card) => card.status === "revision"
    ).length;

    const completed = collection.flashcards.filter(
      (card) => card.status === "completada"
    ).length;

    // Calcular porcentajes
    const newPercentage = calculatePercentage(newFlashcards, totalFlashcards);
    const reviewPercentage = calculatePercentage(dueForReview, totalFlashcards);
    const completedPercentage = calculatePercentage(completed, totalFlashcards);

    // Nivel de conocimiento
    const masterCount = collection.flashcards.filter(
      (card) => card.easeFactor > 3.5
    ).length;

    const learningCount = collection.flashcards.filter(
      (card) => card.easeFactor <= 3.5
    ).length;

    const needReviewCount = collection.flashcards.filter(
      (card) => card.status === "revision"
    ).length;

    const unclassifiedCount =
      collection.flashcards.length -
      masterCount -
      learningCount -
      needReviewCount;

    // Calcular porcentajes de conocimiento
    const masterPercentage = calculatePercentage(masterCount, totalFlashcards);
    const learningPercentage = calculatePercentage(
      learningCount,
      totalFlashcards
    );
    const needReviewPercentage = calculatePercentage(
      needReviewCount,
      totalFlashcards
    );
    const unclassifiedPercentage = calculatePercentage(
      unclassifiedCount,
      totalFlashcards
    );

    // Revisiones y rendimiento
    const totalReviews = collection.flashcards.reduce(
      (sum, card) => sum + (card.reviewCount || 0),
      0
    );

    // Tiempo medio por tarjeta (en segundos)
    const totalTimeSpent = collection.flashcards.reduce(
      (sum, card) => sum + (card.studyTimeInSeconds || 0),
      0
    );
    const avgTimePerCard =
      totalReviews > 0 ? Math.round(totalTimeSpent / totalReviews) : 0;

    // Tasa de éxito (porcentaje de tarjetas con knowledgeLevel = BIEN)
    const successRate = calculatePercentage(
      masterCount,
      collection.flashcards.length || 1
    );

    // Días de estudio (valor por defecto)
    const studyHours = Math.round(totalTimeSpent / 3600);
    const studyMinutes = Math.round((totalTimeSpent % 3660) / 60);

    return {
      // Actividad reciente
      reviewedToday,
      reviewedLast7Days,
      reviewedLast30Days,

      // Estado de las tarjetas
      newFlashcards,
      dueForReview,
      completed,
      newPercentage,
      reviewPercentage,
      completedPercentage,

      // Nivel de conocimiento
      masterCount,
      learningCount,
      needReviewCount,
      unclassifiedCount,
      masterPercentage,
      learningPercentage,
      needReviewPercentage,
      unclassifiedPercentage,

      // Revisiones y rendimiento
      totalReviews,
      avgTimePerCard,
      successRate,
      studyHours,
      studyMinutes,
    };
  };

  // Calcular estadísticas avanzadas
  const advancedStats = calculateAdvancedStats();

  // Calcular el porcentaje de tarjetas completadas
  const completedPercentage = calculatePercentage(
    advancedStats.completed,
    totalFlashcards
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="flex justify-center items-center h-64 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-purple-200 dark:border-purple-900/30"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-purple-500 animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 animate-pulse">
              Cargando estadísticas...
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Resumen general */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 p-6 shadow-lg border border-white/50 dark:border-zinc-800/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                Resumen de la colección
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total flashcards */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Total flashcards
                  </p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {totalFlashcards}
                  </p>
                </div>
              </div>

              {/* Completadas */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Completadas
                  </p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.completed || 0}
                  </p>
                </div>
              </div>

              {/* Tasa de éxito */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Tasa de éxito
                  </p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {Math.round(advancedStats.successRate || 0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  Progreso general
                </p>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {completedPercentage}%
                </p>
              </div>
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${completedPercentage}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Actividad reciente */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg border border-white/50 dark:border-zinc-800/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
                  Actividad reciente
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300">Hoy</p>
                  </div>
                  <p className="text-xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.reviewedToday || 0}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      Últimos 7 días
                    </p>
                  </div>
                  <p className="text-xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.reviewedLast7Days || 0}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      Últimos 30 días
                    </p>
                  </div>
                  <p className="text-xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.reviewedLast30Days || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Estado de las tarjetas */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg border border-white/50 dark:border-zinc-800/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
                  Estado de las tarjetas
                </h3>
              </div>

              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-48 h-48">
                  {/* Circular chart */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Crear datos para el gráfico circular basados en advancedStats */}
                    {[
                      {
                        status: "COMPLETADA",
                        count: advancedStats.completed,
                        color: "#22c55e",
                      },
                      {
                        status: "REVISAR",
                        count: advancedStats.dueForReview,
                        color: "#f59e0b",
                      },
                      {
                        status: "SIN_HACER",
                        count: advancedStats.newFlashcards,
                        color: "#3b82f6",
                      },
                    ].map((estado, index, array) => {
                      // Calculate start and end angles for the pie slice
                      const total = array.reduce((sum, e) => sum + e.count, 0);

                      // Si no hay tarjetas, mostrar un círculo vacío
                      if (total === 0) return null;

                      const startPercent =
                        array
                          .slice(0, index)
                          .reduce((sum, e) => sum + e.count, 0) / total;
                      const endPercent = startPercent + estado.count / total;

                      // Convert to radians
                      const startAngle =
                        startPercent * 2 * Math.PI - Math.PI / 2;
                      const endAngle = endPercent * 2 * Math.PI - Math.PI / 2;

                      // Calculate path
                      const x1 = 50 + 40 * Math.cos(startAngle);
                      const y1 = 50 + 40 * Math.sin(startAngle);
                      const x2 = 50 + 40 * Math.cos(endAngle);
                      const y2 = 50 + 40 * Math.sin(endAngle);

                      // Determine if the arc should be drawn as a large arc
                      const largeArcFlag =
                        endPercent - startPercent > 0.5 ? 1 : 0;

                      // Create the path
                      const path = [
                        `M 50 50`,
                        `L ${x1} ${y1}`,
                        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        `Z`,
                      ].join(" ");

                      return (
                        <path
                          key={estado.status}
                          d={path}
                          fill={estado.color}
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      );
                    })}
                    {/* Center circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="25"
                      fill="white"
                      className="dark:fill-zinc-800"
                    />
                  </svg>

                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-xl font-bold text-zinc-800 dark:text-white">
                      {totalFlashcards}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Total
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Completadas */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        Completadas
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-800 dark:text-white">
                          {advancedStats.completed}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          ({Math.round(advancedStats.completedPercentage)}%)
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${Math.round(
                            advancedStats.completedPercentage
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Para revisar */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        Para revisar
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-800 dark:text-white">
                          {advancedStats.dueForReview}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          ({Math.round(advancedStats.reviewPercentage)}%)
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{
                          width: `${Math.round(
                            advancedStats.reviewPercentage
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Por hacer */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        Por hacer
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-800 dark:text-white">
                          {advancedStats.newFlashcards}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          ({Math.round(advancedStats.newPercentage)}%)
                        </p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${Math.round(advancedStats.newPercentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Nivel de conocimiento */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg border border-white/50 dark:border-zinc-800/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/20">
                  <BookOpen className="w-5 h-5 text-pink-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
                  Nivel de conocimiento
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* Dominadas (BIEN) */}
                <div className="relative overflow-hidden rounded-lg p-4 transition-all hover:shadow-md">
                  <div className="absolute top-0 left-0 h-full w-1 bg-green-500" />
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                          Dominadas
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-800 dark:text-white">
                            {advancedStats.masterCount}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            ({Math.round(advancedStats.masterPercentage)}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500"
                            style={{
                              width: `${Math.round(
                                advancedStats.masterPercentage
                              )}%`,
                              height: "100%",
                            }}
                          />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 min-w-[40px] text-right">
                          {Math.round(advancedStats.masterPercentage)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* En progreso (REGULAR) */}
                <div className="relative overflow-hidden rounded-lg p-4 transition-all hover:shadow-md">
                  <div className="absolute top-0 left-0 h-full w-1 bg-amber-500" />
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                          En progreso
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-800 dark:text-white">
                            {advancedStats.learningCount}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            ({Math.round(advancedStats.learningPercentage)}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500"
                            style={{
                              width: `${Math.round(
                                advancedStats.learningPercentage
                              )}%`,
                              height: "100%",
                            }}
                          />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 min-w-[40px] text-right">
                          {Math.round(advancedStats.learningPercentage)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Necesita repaso (MAL) */}
                <div className="relative overflow-hidden rounded-lg p-4 transition-all hover:shadow-md">
                  <div className="absolute top-0 left-0 h-full w-1 bg-red-500" />
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                          Necesita repaso
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-800 dark:text-white">
                            {advancedStats.needReviewCount}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            ({Math.round(advancedStats.needReviewPercentage)}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="bg-red-500"
                            style={{
                              width: `${Math.round(
                                advancedStats.needReviewPercentage
                              )}%`,
                              height: "100%",
                            }}
                          />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 min-w-[40px] text-right">
                          {Math.round(advancedStats.needReviewPercentage)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sin clasificar */}
                <div className="relative overflow-hidden rounded-lg p-4 transition-all hover:shadow-md">
                  <div className="absolute top-0 left-0 h-full w-1 bg-zinc-500" />
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-500">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                          Sin clasificar
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-800 dark:text-white">
                            {advancedStats.unclassifiedCount}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            ({Math.round(advancedStats.unclassifiedPercentage)}
                            %)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="bg-zinc-500"
                            style={{
                              width: `${Math.round(
                                advancedStats.unclassifiedPercentage
                              )}%`,
                              height: "100%",
                            }}
                          />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 min-w-[40px] text-right">
                          {Math.round(advancedStats.unclassifiedPercentage)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-900/10 dark:to-pink-900/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      Progreso de aprendizaje
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {Math.round(advancedStats.masterPercentage)}% dominado
                  </p>
                </div>

                <div className="relative h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  {/* Create nivelesConocimiento array from advancedStats */}
                  {(() => {
                    const nivelesConocimiento = [
                      {
                        knowledgeLevel: "GOOD",
                        porcentaje: advancedStats.masterPercentage,
                        count: advancedStats.masterCount,
                      },
                      {
                        knowledgeLevel: "REGULAR",
                        porcentaje: advancedStats.learningPercentage,
                        count: advancedStats.learningCount,
                      },
                      {
                        knowledgeLevel: "BAD",
                        porcentaje: advancedStats.needReviewPercentage,
                        count: advancedStats.needReviewCount,
                      },
                      {
                        knowledgeLevel: "UNCLASSIFIED",
                        porcentaje: advancedStats.unclassifiedPercentage,
                        count: advancedStats.unclassifiedCount,
                      },
                    ];

                    return nivelesConocimiento.map((nivel, index) => {
                      // Calculate start position based on previous levels
                      const prevWidth = nivelesConocimiento
                        .slice(0, index)
                        .reduce((sum, n) => sum + n.porcentaje, 0);

                      // Get color based on knowledge level
                      const getColor = () => {
                        switch (nivel.knowledgeLevel) {
                          case "GOOD":
                            return "bg-green-500";
                          case "REGULAR":
                            return "bg-amber-500";
                          case "BAD":
                            return "bg-red-500";
                          default:
                            return "bg-zinc-500";
                        }
                      };

                      return (
                        <div
                          key={nivel.knowledgeLevel || "null"}
                          className={`absolute top-0 h-full ${getColor()}`}
                          style={{
                            left: `${prevWidth}%`,
                            width: `${Math.round(nivel.porcentaje)}%`,
                          }}
                        />
                      );
                    });
                  })()}

                  {/* Milestone markers */}
                  <div className="absolute top-0 left-1/4 h-full w-px bg-white/50 dark:bg-zinc-600/50" />
                  <div className="absolute top-0 left-1/2 h-full w-px bg-white/50 dark:bg-zinc-600/50" />
                  <div className="absolute top-0 left-3/4 h-full w-px bg-white/50 dark:bg-zinc-600/50" />
                </div>

                <div className="flex justify-between mt-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">0%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    25%
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    50%
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    75%
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    100%
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Revisiones */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg border border-white/50 dark:border-zinc-800/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
                  Revisiones
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Hoy
                  </p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.reviewedToday || 0}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Últimos 7 días
                  </p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.reviewedLast7Days || 0}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Últimos 30 días
                  </p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.reviewedLast30Days || 0}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.totalReviews || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Rendimiento */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg border border-white/50 dark:border-zinc-800/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
                  Rendimiento
                </h3>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                      className="dark:stroke-zinc-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#successGradient)"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 45 * (1 - advancedStats.successRate / 100)
                      }`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient
                        id="successGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-3xl font-bold text-zinc-800 dark:text-white">
                      {Math.round(advancedStats.successRate)}%
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Tasa de éxito
                    </p>
                  </div>
                </div>
              </div>

              {/* Streak section removed as requested */}
            </motion.div>

            {/* Tiempo de estudio */}
            <motion.div
              variants={itemVariants}
              className="rounded-xl bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm p-6 shadow-lg border border-white/50 dark:border-zinc-800/50 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <Timer className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
                  Tiempo de estudio
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock4 className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Tiempo medio
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.avgTimePerCard}{" "}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      seg/tarjeta
                    </span>
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Horas de estudio
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.studyHours}{" "}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      h{" "}
                    </span>
                    {advancedStats.studyMinutes}{" "}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      m{" "}
                    </span>
                  </p>
                </div>

                <div className="col-span-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Tarjetas pendientes hoy
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {advancedStats.dueForReview}{" "}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      flashcards
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
