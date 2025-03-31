"use client";

import { Flame, Crown, Target, Calendar } from "lucide-react";
import RankingCard from "./RankingCard";

export default function ConsistencyTab({ users }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RankingCard
        title="Racha Actual"
        icon={Flame}
        color="text-orange-500"
        gradient="from-orange-500 to-red-500"
        users={users}
        getValue={(user) => user.stats.currentStreak}
        format={(value) => `${value} días`}
      />

      <RankingCard
        title="Mejor Racha"
        icon={Crown}
        color="text-orange-500"
        gradient="from-orange-500 to-red-500"
        users={users}
        getValue={(user) => user.stats.bestStreak}
        format={(value) => `${value} días`}
      />

      <RankingCard
        title="Objetivos Diarios"
        icon={Target}
        color="text-orange-500"
        gradient="from-orange-500 to-red-500"
        users={users}
        getValue={(user) => user.stats.dailyGoalsCompleted}
        format={(value) => `${value} completados`}
      />

      <RankingCard
        title="Días de Estudio"
        icon={Calendar}
        color="text-orange-500"
        gradient="from-orange-500 to-red-500"
        users={users}
        getValue={(user) => user.stats.totalStudyDays}
        format={(value) => `${value} días`}
        chartData={(users) => users.slice(0, 5).map(user => ({
          name: user.name,
          value: user.stats.totalStudyDays
        }))}
      />

      <RankingCard
        title="Días de Estudio Semanales"
        icon={Calendar}
        color="text-orange-500"
        gradient="from-orange-500 to-red-500"
        users={users}
        getValue={(user) => user.stats.weeklyStudyDays}
        format={(value) => `${value} días`}
      />

      <RankingCard
        title="Sesiones Completadas"
        icon={Target}
        color="text-orange-500"
        gradient="from-orange-500 to-red-500"
        users={users}
        getValue={(user) => user.stats.studySessionsCompleted}
        format={(value) => value.toLocaleString()}
      />
    </div>
  );
}
