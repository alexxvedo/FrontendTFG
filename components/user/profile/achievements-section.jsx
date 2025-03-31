"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApi } from "@/lib/api";
import Confetti from "react-dom-confetti";
import {
  Trophy,
  Star,
  Flame,
  Brain,
  Target,
  Zap,
  BookOpen,
  Users,
  Crown,
  Award,
  Medal,
  Clock,
} from "lucide-react";

const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 100,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  colors: ["#FFD700", "#FFA500", "#FF4500", "#FF6347", "#FF8C00"],
};

export function AchievementsSection({ userStats }) {
  const api = useApi();
  const [claimedAchievements, setClaimedAchievements] = useState({});
  const [confettiActive, setConfettiActive] = useState({});

  console.log("User stats: ", userStats);

  const handleClaimAchievement = async (achievementId) => {
    try {
      // Marcar como reclamado localmente
      setClaimedAchievements((prev) => ({ ...prev, [achievementId]: true }));

      // Activar confeti para este logro
      setConfettiActive((prev) => ({ ...prev, [achievementId]: true }));

      // Desactivar confeti después de la animación
      setTimeout(() => {
        setConfettiActive((prev) => ({ ...prev, [achievementId]: false }));
      }, 3000);

      // Incrementar el contador de logros
      await api.userStats.achievementCompleted(userStats.user.email);

      // Actualizar la lista de logros desbloqueados
      if (!userStats.unlockedAchievements.includes(achievementId)) {
        userStats.unlockedAchievements.push(achievementId);
      }
    } catch (error) {
      console.error("Error claiming achievement:", error);
      // Revertir el estado si hay error
      setClaimedAchievements((prev) => ({ ...prev, [achievementId]: false }));
    }
  };

  if (!userStats) return null;

  const achievementCategories = [
    {
      name: "Study Mastery",
      icon: Brain,
      achievements: [
        {
          name: "Knowledge Seeker",
          description: "Study 100 flashcards",
          icon: Brain,
          rarity: "Common",
          id: "knowledge_seeker",
          progress: userStats.studiedFlashcards || 0,
          target: 100,
        },
        {
          name: "Master Scholar",
          description: "Study 1000 flashcards",
          icon: Crown,
          rarity: "Epic",
          id: "master_scholar",
          progress: userStats.studiedFlashcards || 0,
          target: 1000,
        },
        {
          name: "Time Lord",
          description: "Study for 24 hours total",
          icon: Clock,
          rarity: "Rare",
          id: "time_lord",
          progress: Math.floor((userStats.studySeconds || 0) / 3600),
          target: 24,
        },
      ],
    },
    {
      name: "Consistency",
      icon: Flame,
      achievements: [
        {
          name: "Daily Learner",
          description: "Complete 7 days streak",
          icon: Flame,
          rarity: "Common",
          id: "daily_learner",
          progress: userStats.dailyStreak || 0,
          target: 7,
        },
        {
          name: "Study Warrior",
          description: "Complete 30 days streak",
          icon: Award,
          rarity: "Rare",
          id: "study_warrior",
          progress: userStats.dailyStreak || 0,
          target: 30,
        },
        {
          name: "Learning Legend",
          description: "Complete 365 days streak",
          icon: Crown,
          rarity: "Legendary",
          id: "learning_legend",
          progress: userStats.dailyStreak || 0,
          target: 365,
        },
      ],
    },
    {
      name: "Creation",
      icon: BookOpen,
      achievements: [
        {
          name: "Content Creator",
          description: "Create 50 flashcards",
          icon: BookOpen,
          rarity: "Common",
          id: "content_creator",
          progress: userStats.createdFlashcards || 0,
          target: 50,
        },
        {
          name: "Knowledge Architect",
          description: "Create 10 collections",
          icon: Zap,
          rarity: "Rare",
          id: "knowledge_architect",
          progress: userStats.totalCollections || 0,
          target: 10,
        },
      ],
    },
    {
      name: "Mastery",
      icon: Target,
      achievements: [
        {
          name: "Accuracy Master",
          description: "Achieve 95% accuracy in 10 study sessions",
          icon: Target,
          rarity: "Epic",
          id: "accuracy_master",
          progress: userStats.studySessionsCompleted || 0,
          target: 10,
          condition: userStats.averageAccuracy >= 95,
        },
        {
          name: "Perfect Streak",
          description: "Complete 5 perfect study sessions in a row",
          icon: Star,
          rarity: "Legendary",
          id: "perfect_streak",
          progress: userStats.perfectStudySessions || 0,
          target: 5,
        },
      ],
    },
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "Legendary":
        return "from-yellow-400 to-amber-600";
      case "Epic":
        return "from-purple-400 to-pink-600";
      case "Rare":
        return "from-blue-400 to-cyan-600";
      case "Common":
        return "from-gray-400 to-gray-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getRarityBorderColor = (rarity) => {
    switch (rarity) {
      case "Legendary":
        return "border-yellow-500/30";
      case "Epic":
        return "border-purple-500/30";
      case "Rare":
        return "border-blue-500/30";
      case "Common":
        return "border-gray-500/30";
      default:
        return "border-gray-500/30";
    }
  };

  const isAchievementUnlocked = (achievement) => {
    if (achievement.condition !== undefined) {
      return (
        achievement.progress >= achievement.target && achievement.condition
      );
    }
    return achievement.progress >= achievement.target;
  };

  const unlockedAchievements = userStats.unlockedAchievements || [];

  return (
    <div className="space-y-8">
      {/* Achievement Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 md:col-span-4 p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white">
                Achievement Progress
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {unlockedAchievements.length} /{" "}
                {userStats.totalAchievements || 0}
              </span>
            </div>
          </div>
          <Progress
            value={
              (unlockedAchievements.length /
                (userStats.totalAchievements || 1)) *
              100
            }
            className="h-2 bg-zinc-800"
          />
        </div>
      </div>

      {/* Achievement Categories */}
      {achievementCategories.map((category, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <category.icon className="h-5 w-5 text-purple-400" />
            {category.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.achievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const unlockable = isAchievementUnlocked(achievement);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${getRarityBorderColor(
                    achievement.rarity
                  )} bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-all group relative overflow-hidden ${
                    isUnlocked || claimedAchievements[achievement.id]
                      ? "ring-2 ring-yellow-500/30"
                      : ""
                  }`}
                >
                  {/* Confetti container */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <Confetti
                      active={confettiActive[achievement.id]}
                      config={confettiConfig}
                    />
                  </div>

                  {/* Achievement Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-r ${getRarityColor(
                          achievement.rarity
                        )} flex items-center justify-center ${
                          isUnlocked ? "opacity-100" : "opacity-50"
                        }`}
                      >
                        <achievement.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`bg-gradient-to-r ${getRarityColor(
                        achievement.rarity
                      )} bg-clip-text text-transparent border-zinc-700`}
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress
                      value={(achievement.progress / achievement.target) * 100}
                      className={`h-2 bg-zinc-800 ${
                        unlockable ? "bg-yellow-500/30" : ""
                      }`}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        {achievement.progress} / {achievement.target}
                      </span>
                      {isUnlocked && (
                        <span className="text-sm text-yellow-500">
                          Unlocked!
                        </span>
                      )}
                      {!isUnlocked &&
                        unlockable &&
                        !claimedAchievements[achievement.id] && (
                          <button
                            onClick={() =>
                              handleClaimAchievement(achievement.id)
                            }
                            className="text-sm text-yellow-500 animate-pulse hover:text-yellow-400 transition-colors"
                          >
                            Click to claim!
                          </button>
                        )}
                      {claimedAchievements[achievement.id] && (
                        <span className="text-sm text-yellow-500">
                          Claimed!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
