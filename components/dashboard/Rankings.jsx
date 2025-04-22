"use client";

import { useState } from "react";
import {
  Trophy,
  Flame,
  Brain,
  Users,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUserStats } from "./rankings/utils";
import GeneralTab from "./rankings/GeneralTab";
import StudyTab from "./rankings/StudyTab";
import ConsistencyTab from "./rankings/ConsistencyTab";
import CreationTab from "./rankings/CreationTab";
import SocialTab from "./rankings/SocialTab";
import { motion, AnimatePresence } from "framer-motion";

export default function Rankings({ users = [] }) {
  const [activeTab, setActiveTab] = useState("general");

  // Añadir estadísticas de ejemplo a los usuarios
  const usersWithStats = users.map((user) => ({
    ...user,
    stats: mockUserStats(user),
  }));

  // Configuración de las pestañas
  const tabs = [
    {
      id: "general",
      label: "General",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
    },
    {
      id: "study",
      label: "Estudio",
      icon: Brain,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      id: "consistency",
      label: "Constancia",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    },
    {
      id: "creation",
      label: "Creación",
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      id: "social",
      label: "Social",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
  ];

  return (
    <div className="rounded-xl overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="border-b border-border dark:border-gray-800 mb-2">
          <TabsList className="bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-foreground dark:data-[state=active]:text-white rounded-none px-4 py-2 text-muted-foreground dark:text-gray-400"
              >
                <tab.icon className={`h-4 w-4 mr-2 ${tab.color}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="relative ">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/5 via-purple-500/5 to-gray-50/5 dark:from-gray-900/10 dark:via-purple-500/5 dark:to-gray-900/10 rounded-xl opacity-50 pointer-events-none" />

          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pb-4"
              >
                <GeneralTab users={usersWithStats} />
              </motion.div>
            )}

            {activeTab === "study" && (
              <motion.div
                key="study"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pb-4"
              >
                <StudyTab users={usersWithStats} />
              </motion.div>
            )}

            {activeTab === "consistency" && (
              <motion.div
                key="consistency"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pb-4"
              >
                <ConsistencyTab users={usersWithStats} />
              </motion.div>
            )}

            {activeTab === "creation" && (
              <motion.div
                key="creation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pb-4"
              >
                <CreationTab users={usersWithStats} />
              </motion.div>
            )}

            {activeTab === "social" && (
              <motion.div
                key="social"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pb-4"
              >
                <SocialTab users={usersWithStats} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
