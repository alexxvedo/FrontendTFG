"use client";

import { BookOpen, FolderPlus, Share2, Star } from "lucide-react";
import RankingCard from "./RankingCard";

export default function CreationTab({ users }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RankingCard
        title="Tarjetas Creadas"
        icon={BookOpen}
        color="text-green-500"
        gradient="from-green-500 to-emerald-500"
        users={users}
        getValue={(user) => user.stats.cardsCreated}
        format={(value) => value.toLocaleString()}
      />

      <RankingCard
        title="Colecciones"
        icon={FolderPlus}
        color="text-green-500"
        gradient="from-green-500 to-emerald-500"
        users={users}
        getValue={(user) => user.stats.collections}
        format={(value) => `${value} colecciones`}
      />

      <RankingCard
        title="Contenido Compartido"
        icon={Share2}
        color="text-green-500"
        gradient="from-green-500 to-emerald-500"
        users={users}
        getValue={(user) => user.stats.sharedContent}
        format={(value) => value.toLocaleString()}
      />

      <RankingCard
        title="Calidad de las Tarjetas"
        icon={Star}
        color="text-green-500"
        gradient="from-green-500 to-emerald-500"
        users={users}
        getValue={(user) => user.stats.qualityRating}
        format={(value) => `${value} estrellas`}
      />

      <RankingCard
        title="Tarjetas Reutilizadas"
        icon={BookOpen}
        color="text-green-500"
        gradient="from-green-500 to-emerald-500"
        users={users}
        getValue={(user) => user.stats.cardsReused}
        format={(value) => value.toLocaleString()}
      />

      <RankingCard
        title="Plantillas Creadas"
        icon={FolderPlus}
        color="text-green-500"
        gradient="from-green-500 to-emerald-500"
        users={users}
        getValue={(user) => user.stats.templatesCreated}
        format={(value) => value.toLocaleString()}
      />
    </div>
  );
}
