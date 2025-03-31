"use client";

import { Brain, Clock, Target, CheckCircle, Zap } from "lucide-react";
import RankingCard from "./RankingCard";

export default function StudyTab({ users }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RankingCard
        title="Tarjetas Estudiadas"
        icon={Brain}
        color="text-blue-500"
        gradient="from-blue-500 to-cyan-500"
        users={users}
        getValue={(user) => user.stats.cardsStudied}
        format={(value) => value.toLocaleString()}
        chartData={(users) => users.slice(0, 5).map(user => ({
          name: user.name,
          value: user.stats.cardsStudied
        }))}
      />

      <RankingCard
        title="Tiempo de Estudio"
        icon={Clock}
        color="text-blue-500"
        gradient="from-blue-500 to-cyan-500"
        users={users}
        getValue={(user) => user.stats.studyTimeMinutes}
        format={(value) => {
          const hours = Math.floor(value / 60);
          const minutes = value % 60;
          return `${hours}h ${minutes}m`;
        }}
      />

      <RankingCard
        title="Precisión"
        icon={Target}
        color="text-blue-500"
        gradient="from-blue-500 to-cyan-500"
        users={users}
        getValue={(user) => user.stats.accuracy}
        format={(value) => `${value}%`}
      />

      <RankingCard
        title="Repasos Perfectos"
        icon={CheckCircle}
        color="text-blue-500"
        gradient="from-blue-500 to-cyan-500"
        users={users}
        getValue={(user) => user.stats.perfectReviews}
        format={(value) => value.toLocaleString()}
      />

      <RankingCard
        title="Respuestas Correctas"
        icon={CheckCircle}
        color="text-blue-500"
        gradient="from-blue-500 to-cyan-500"
        users={users}
        getValue={(user) => user.stats.correctAnswers}
        format={(value) => value.toLocaleString()}
      />

      <RankingCard
        title="Respuestas Incorrectas"
        icon={Zap}
        color="text-blue-500"
        gradient="from-blue-500 to-cyan-500"
        users={users}
        getValue={(user) => user.stats.wrongAnswers}
        format={(value) => value.toLocaleString()}
      />
    </div>
  );
}
