"use client";
import { useState, useCallback, useEffect } from "react";
import { useApi } from "@/lib/api";
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
  Timer
} from "lucide-react";

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

  // Calculate percentages for progress bars
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  };

  const totalFlashcards = collection?.flashcards?.length || 0;
  const completedPercentage = calculatePercentage(
    estados.find(e => e.status === "COMPLETADA")?.count || 0,
    totalFlashcards
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
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
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total flashcards</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">{totalFlashcards}</p>
                </div>
              </div>
              
              {/* Completadas */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Completadas</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {estados.find(e => e.status === "COMPLETADA")?.count || 0}
                  </p>
                </div>
              </div>
              
              {/* Tasa de éxito */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tasa de éxito</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {Math.round(flashcardsStats.successRate || flashcardsStats.porcentajeExito || 0)}%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Progreso general</p>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{completedPercentage}%</p>
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
                    {flashcardsStats.creadasHoy || 0}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300">Últimos 7 días</p>
                  </div>
                  <p className="text-xl font-bold text-zinc-800 dark:text-white">
                    {flashcardsStats.creadasUltimos7Dias || 0}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300">Últimos 30 días</p>
                  </div>
                  <p className="text-xl font-bold text-zinc-800 dark:text-white">
                    {flashcardsStats.creadasUltimos30Dias || 0}
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
                    {estados.map((estado, index) => {
                      // Calculate start and end angles for the pie slice
                      const total = estados.reduce((sum, e) => sum + e.count, 0);
                      const startPercent = estados.slice(0, index).reduce((sum, e) => sum + e.count, 0) / total;
                      const endPercent = startPercent + estado.count / total;
                      
                      // Convert to radians
                      const startAngle = startPercent * 2 * Math.PI - Math.PI / 2;
                      const endAngle = endPercent * 2 * Math.PI - Math.PI / 2;
                      
                      // Calculate path
                      const x1 = 50 + 40 * Math.cos(startAngle);
                      const y1 = 50 + 40 * Math.sin(startAngle);
                      const x2 = 50 + 40 * Math.cos(endAngle);
                      const y2 = 50 + 40 * Math.sin(endAngle);
                      
                      // Determine if the arc should be drawn as a large arc
                      const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
                      
                      // Create the path
                      const path = [
                        `M 50 50`,
                        `L ${x1} ${y1}`,
                        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        `Z`
                      ].join(' ');
                      
                      return (
                        <path 
                          key={estado.status} 
                          d={path} 
                          fill={
                            estado.status === "COMPLETADA"
                              ? "#22c55e" // green-500
                              : estado.status === "REVISAR"
                              ? "#f59e0b" // amber-500
                              : "#3b82f6" // blue-500
                          }
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      );
                    })}
                    {/* Center circle */}
                    <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-zinc-800" />
                  </svg>
                  
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-xl font-bold text-zinc-800 dark:text-white">
                      {estados.reduce((sum, e) => sum + e.count, 0)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Total</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {estados.map((estado) => (
                  <div key={estado.status} className="flex items-center gap-3">
                    <div 
                      className={`w-4 h-4 rounded-full ${
                        estado.status === "COMPLETADA"
                          ? "bg-green-500"
                          : estado.status === "REVISAR"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                          {estado.status === "SIN_HACER"
                            ? "Por hacer"
                            : estado.status === "REVISAR"
                            ? "Para revisar"
                            : "Completadas"}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-zinc-800 dark:text-white">
                            {estado.count}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            ({Math.round(estado.porcentaje)}%)
                          </p>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            estado.status === "COMPLETADA"
                              ? "bg-green-500"
                              : estado.status === "REVISAR"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.round(estado.porcentaje)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                {nivelesConocimiento.map((nivel) => {
                  // Define colors and icons based on knowledge level
                  const getColor = () => {
                    switch(nivel.knowledgeLevel) {
                      case "GOOD": return "bg-green-500";
                      case "REGULAR": return "bg-amber-500";
                      case "BAD": return "bg-red-500";
                      default: return "bg-zinc-500";
                    }
                  };
                  
                  const getLabel = () => {
                    switch(nivel.knowledgeLevel) {
                      case "GOOD": return "Dominadas";
                      case "REGULAR": return "En progreso";
                      case "BAD": return "Necesita repaso";
                      default: return "Sin clasificar";
                    }
                  };
                  
                  const getIcon = () => {
                    switch(nivel.knowledgeLevel) {
                      case "GOOD": return <CheckCircle className="w-5 h-5 text-white" />;
                      case "REGULAR": return <Activity className="w-5 h-5 text-white" />;
                      case "BAD": return <Clock className="w-5 h-5 text-white" />;
                      default: return <BookOpen className="w-5 h-5 text-white" />;
                    }
                  };
                  
                  return (
                    <div 
                      key={nivel.knowledgeLevel || "null"} 
                      className="relative overflow-hidden rounded-lg p-4 transition-all hover:shadow-md"
                    >
                      <div className={`absolute top-0 left-0 h-full w-1 ${getColor()}`} />
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColor()}`}>
                          {getIcon()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                              {getLabel()}
                            </p>
                            <p className="text-xl font-bold text-zinc-800 dark:text-white">
                              {nivel.count}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={getColor()}
                                style={{ width: `${Math.round(nivel.porcentaje)}%`, height: '100%' }}
                              />
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 min-w-[40px] text-right">
                              {Math.round(nivel.porcentaje)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-pink-50 dark:from-blue-900/10 dark:to-pink-900/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Progreso de aprendizaje</p>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {Math.round((nivelesConocimiento.find(n => n.knowledgeLevel === "GOOD")?.count || 0) / 
                      (nivelesConocimiento.reduce((sum, n) => sum + n.count, 0) || 1) * 100)}% dominado
                  </p>
                </div>
                
                <div className="relative h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  {/* Stacked progress bars */}
                  {nivelesConocimiento.map((nivel, index) => {
                    // Calculate start position based on previous levels
                    const prevWidth = nivelesConocimiento
                      .slice(0, index)
                      .reduce((sum, n) => sum + n.porcentaje, 0);
                    
                    // Get color based on knowledge level
                    const getColor = () => {
                      switch(nivel.knowledgeLevel) {
                        case "GOOD": return "bg-green-500";
                        case "REGULAR": return "bg-amber-500";
                        case "BAD": return "bg-red-500";
                        default: return "bg-zinc-500";
                      }
                    };
                    
                    return (
                      <div 
                        key={nivel.knowledgeLevel || "null"}
                        className={`absolute top-0 h-full ${getColor()}`}
                        style={{ 
                          left: `${prevWidth}%`, 
                          width: `${Math.round(nivel.porcentaje)}%` 
                        }}
                      />
                    );
                  })}
                  
                  {/* Milestone markers */}
                  <div className="absolute top-0 left-1/4 h-full w-px bg-white/50 dark:bg-zinc-600/50" />
                  <div className="absolute top-0 left-1/2 h-full w-px bg-white/50 dark:bg-zinc-600/50" />
                  <div className="absolute top-0 left-3/4 h-full w-px bg-white/50 dark:bg-zinc-600/50" />
                </div>
                
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">0%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">25%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">50%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">75%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">100%</p>
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
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Hoy</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">{flashcardsStats.revisadasHoy || 0}</p>
                </div>
                
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Últimos 7 días</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">{flashcardsStats.revisadasUltimos7Dias || 0}</p>
                </div>
                
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Últimos 30 días</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">{flashcardsStats.revisadasUltimos30Dias || 0}</p>
                </div>
                
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 p-4">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">{flashcardsStats.totalRevisadas || 0}</p>
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
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (flashcardsStats.successRate || flashcardsStats.porcentajeExito || 0) / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <p className="text-3xl font-bold text-zinc-800 dark:text-white">
                      {Math.round(flashcardsStats.successRate || flashcardsStats.porcentajeExito || 0)}%
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Tasa de éxito</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Racha actual</p>
                    <p className="text-xl font-bold text-zinc-800 dark:text-white">{flashcardsStats.rachaActual || 0} días</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Mejor racha</p>
                    <p className="text-xl font-bold text-zinc-800 dark:text-white">{flashcardsStats.rachaMasLarga || 0} días</p>
                  </div>
                </div>
              </div>
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
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tiempo medio</p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {Math.round(flashcardsStats.tiempoMedioRevision || 0)} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">seg/tarjeta</span>
                  </p>
                </div>
                
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Días de estudio</p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {flashcardsStats.diasTotalesEstudio || 0} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">días</span>
                  </p>
                </div>
                
                <div className="col-span-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tarjetas pendientes hoy</p>
                  </div>
                  <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                    {flashcardsStats.dueForReview || 0} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">flashcards</span>
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
