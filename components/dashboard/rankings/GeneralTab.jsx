"use client";

import { Star, Zap, Medal, Crown } from "lucide-react";
import RankingCard from "./RankingCard";

export default function GeneralTab({ users }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RankingCard
        title="Nivel"
        icon={Star}
        color="text-yellow-500"
        gradient="from-yellow-500 to-amber-500"
        users={users}
        getValue={(user) => user.stats.level}
        format={(value) => `Nivel ${value}`}
        chartData={(users) => users.slice(0, 5).map(user => ({
          name: user.name,
          value: user.stats.level
        }))}
      />

      <RankingCard
        title="Experiencia Total"
        icon={Zap}
        color="text-yellow-500"
        gradient="from-yellow-500 to-amber-500"
        users={users}
        getValue={(user) => user.stats.totalXP}
        format={(value) => `${value.toLocaleString()} XP`}
      />

      <RankingCard
        title="Logros"
        icon={Medal}
        color="text-yellow-500"
        gradient="from-yellow-500 to-amber-500"
        users={users}
        getValue={(user) => user.stats.achievements}
        format={(value) => `${value} logros`}
      />

      <RankingCard
        title="Rango Global"
        icon={Crown}
        color="text-yellow-500"
        gradient="from-yellow-500 to-amber-500"
        users={users}
        getValue={(user) => user.stats.rank}
        format={(value) => `Rango ${value}`}
      />
    </div>
  );
}
