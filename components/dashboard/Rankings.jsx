"use client";

import { useState } from "react";
import { Trophy, Flame, Brain, Users, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUserStats } from "./rankings/utils";
import GeneralTab from "./rankings/GeneralTab";
import StudyTab from "./rankings/StudyTab";
import ConsistencyTab from "./rankings/ConsistencyTab";
import CreationTab from "./rankings/CreationTab";
import SocialTab from "./rankings/SocialTab";

export default function Rankings({ users = [] }) {
  const [activeTab, setActiveTab] = useState("general");

  // Añadir estadísticas de ejemplo a los usuarios
  const usersWithStats = users.map((user) => ({
    ...user,
    stats: mockUserStats(user),
  }));

  return (
    <div className="p-6 bg-white/5 rounded-xl border border-gray-800">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
          >
            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="study"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
          >
            <Brain className="h-4 w-4 mr-2 text-blue-500" />
            Estudio
          </TabsTrigger>
          <TabsTrigger
            value="consistency"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
          >
            <Flame className="h-4 w-4 mr-2 text-orange-500" />
            Constancia
          </TabsTrigger>
          <TabsTrigger
            value="creation"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
          >
            <BookOpen className="h-4 w-4 mr-2 text-green-500" />
            Creación
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20"
          >
            <Users className="h-4 w-4 mr-2 text-purple-500" />
            Social
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralTab users={usersWithStats} />
        </TabsContent>

        <TabsContent value="study">
          <StudyTab users={usersWithStats} />
        </TabsContent>

        <TabsContent value="consistency">
          <ConsistencyTab users={usersWithStats} />
        </TabsContent>

        <TabsContent value="creation">
          <CreationTab users={usersWithStats} />
        </TabsContent>

        <TabsContent value="social">
          <SocialTab users={usersWithStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
