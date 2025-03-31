"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Target, Zap, Brain, Clock, Flame } from "lucide-react";

const GameStats = ({ collection }) => {
  // Cálculos de estadísticas de juego
  const totalFlashcards = 20; // Objetivo de flashcards por colección
  const progress = Math.min(100, Math.floor((collection.flashcards?.length || 0) / totalFlashcards * 100));
  const accuracy = 85; // Temporal, reemplazar con datos reales
  const totalStudyTime = Math.floor(Math.random() * 500); // Temporal, reemplazar con datos reales

  const stats = [
    {
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      label: "Progreso",
      value: progress,
      suffix: "%"
    },
    {
      icon: Brain,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      label: "Tarjetas",
      value: collection.flashcards?.length || 0,
      suffix: "/20"
    },
    {
      icon: Zap,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      label: "Precisión",
      value: accuracy,
      suffix: "%"
    },
    {
      icon: Clock,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      label: "Tiempo Total",
      value: Math.floor(totalStudyTime / 60),
      suffix: "h"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className="relative overflow-hidden bg-gray-900/50 border-0 backdrop-blur-sm"
        >
          <div className={`absolute inset-0 ${stat.bgColor} opacity-10`} />
          <div className={`absolute inset-x-0 top-0 h-1 ${stat.bgColor}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${stat.bgColor} ${stat.borderColor} border`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                  {stat.suffix}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GameStats;
