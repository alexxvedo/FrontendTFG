"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Zap,
  Brain,
  BookOpen,
  Users,
  Target,
  Crown,
  Clock,
  Flame,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

const ACHIEVEMENT_CATEGORIES = {
  LEARNING: "Learning",
  SOCIAL: "Social",
  MILESTONES: "Milestones",
  SPECIAL: "Special",
};

const ACHIEVEMENTS = [
  {
    id: "first_flashcard",
    name: "First Step",
    description: "Create your first flashcard",
    category: ACHIEVEMENT_CATEGORIES.LEARNING,
    icon: BookOpen,
    color: "purple",
    xp: 50,
  },
  {
    id: "study_streak_7",
    name: "Weekly Warrior",
    description: "Maintain a 7-day study streak",
    category: ACHIEVEMENT_CATEGORIES.LEARNING,
    icon: Flame,
    color: "orange",
    xp: 100,
  },
  {
    id: "master_collection",
    name: "Collection Master",
    description: "Master all flashcards in a collection",
    category: ACHIEVEMENT_CATEGORIES.LEARNING,
    icon: Crown,
    color: "yellow",
    xp: 200,
  },
  {
    id: "social_study",
    name: "Study Buddy",
    description: "Study with another user",
    category: ACHIEVEMENT_CATEGORIES.SOCIAL,
    icon: Users,
    color: "blue",
    xp: 75,
  },
  {
    id: "share_collection",
    name: "Knowledge Sharer",
    description: "Share a collection with others",
    category: ACHIEVEMENT_CATEGORIES.SOCIAL,
    icon: Sparkles,
    color: "pink",
    xp: 50,
  },
  {
    id: "study_time_1h",
    name: "Focus Master",
    description: "Study for 1 hour straight",
    category: ACHIEVEMENT_CATEGORIES.MILESTONES,
    icon: Clock,
    color: "cyan",
    xp: 100,
  },
  {
    id: "perfect_session",
    name: "Perfect Score",
    description: "Complete a study session with 100% accuracy",
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    icon: Target,
    color: "green",
    xp: 150,
  },
  // Add more achievements as needed
];

function AchievementCard({ achievement, isUnlocked, progress }) {
  const colorVariants = {
    purple:
      "from-purple-500/20 to-transparent border-purple-500/20 text-purple-400",
    blue: "from-blue-500/20 to-transparent border-blue-500/20 text-blue-400",
    green:
      "from-green-500/20 to-transparent border-green-500/20 text-green-400",
    yellow:
      "from-yellow-500/20 to-transparent border-yellow-500/20 text-yellow-400",
    orange:
      "from-orange-500/20 to-transparent border-orange-500/20 text-orange-400",
    pink: "from-pink-500/20 to-transparent border-pink-500/20 text-pink-400",
    cyan: "from-cyan-500/20 to-transparent border-cyan-500/20 text-cyan-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-xl bg-gradient-to-br ${
        colorVariants[achievement.color]
      } border`}
    >
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-2 bg-${achievement.color}-500/10`}>
          <achievement.icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">{achievement.name}</h3>
            <span className="text-sm font-medium">+{achievement.xp} XP</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {achievement.description}
          </p>

          {typeof progress === "number" && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-gray-400">{Math.round(progress)}%</span>
              </div>
              <Progress
                value={progress}
                className="h-1.5"
                indicatorClassName={`bg-${achievement.color}-500`}
              />
            </div>
          )}
        </div>
      </div>

      {isUnlocked && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ring-2 ring-[#0A0A0F]"
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

export function AchievementsSection({ userStats }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const unlockedAchievements = userStats?.achievements || [];

  const categories = [
    { id: "all", name: "All" },
    ...Object.values(ACHIEVEMENT_CATEGORIES).map((category) => ({
      id: category.toLowerCase(),
      name: category,
    })),
  ];

  const filteredAchievements = ACHIEVEMENTS.filter(
    (achievement) =>
      selectedCategory === "all" ||
      achievement.category.toLowerCase() === selectedCategory
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/10"
        >
          <Trophy className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {unlockedAchievements.length}
          </p>
          <p className="text-sm text-gray-400">Unlocked</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10"
        >
          <Star className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {ACHIEVEMENTS.length - unlockedAchievements.length}
          </p>
          <p className="text-sm text-gray-400">Locked</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/10"
        >
          <Brain className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {Math.round(
              (unlockedAchievements.length / ACHIEVEMENTS.length) * 100
            )}
            %
          </p>
          <p className="text-sm text-gray-400">Completion</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/10"
        >
          <Zap className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white">
            {unlockedAchievements.reduce((total, achievement) => {
              const achievementData = ACHIEVEMENTS.find(
                (a) => a.id === achievement
              );
              return total + (achievementData?.xp || 0);
            }, 0)}
          </p>
          <p className="text-sm text-gray-400">Total XP</p>
        </motion.div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="wait">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={unlockedAchievements.includes(achievement.id)}
              progress={
                achievement.id === "study_streak_7"
                  ? ((userStats?.dailyStreak || 0) / 7) * 100
                  : undefined
              }
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
