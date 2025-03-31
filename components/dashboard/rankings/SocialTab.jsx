"use client";

import { Users, Handshake, Heart, Crown } from "lucide-react";
import RankingCard from "./RankingCard";

export default function SocialTab({ users }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RankingCard
        title="Grupos de Estudio"
        icon={Users}
        color="text-purple-500"
        gradient="from-purple-500 to-pink-500"
        users={users}
        getValue={(user) => user.stats.studyGroups}
        format={(value) => `${value} grupos`}
      />

      <RankingCard
        title="Colaboraciones"
        icon={Handshake}
        color="text-purple-500"
        gradient="from-purple-500 to-pink-500"
        users={users}
        getValue={(user) => user.stats.collaborations}
        format={(value) => value.toLocaleString()}
      />

      <RankingCard
        title="Usuarios Ayudados"
        icon={Heart}
        color="text-purple-500"
        gradient="from-purple-500 to-pink-500"
        users={users}
        getValue={(user) => user.stats.helpedUsers}
        format={(value) => `${value} usuarios`}
      />

      <RankingCard
        title="Reputación"
        icon={Crown}
        color="text-purple-500"
        gradient="from-purple-500 to-pink-500"
        users={users}
        getValue={(user) => user.stats.reputation}
        format={(value) => `${value} puntos`}
      />

      <RankingCard
        title="Seguidores"
        icon={Users}
        color="text-purple-500"
        gradient="from-purple-500 to-pink-500"
        users={users}
        getValue={(user) => user.stats.followers}
        format={(value) => value.toLocaleString()}
      />

      <RankingCard
        title="Contribuciones"
        icon={Handshake}
        color="text-purple-500"
        gradient="from-purple-500 to-pink-500"
        users={users}
        getValue={(user) => user.stats.contributions}
        format={(value) => value.toLocaleString()}
      />
    </div>
  );
}
