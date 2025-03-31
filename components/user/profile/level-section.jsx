"use client";

import { Progress } from "@/components/ui/progress";
import {
  Star,
  Zap,
  Trophy,
  Crown,
  Target,
  Brain,
  BookOpen,
  Users,
} from "lucide-react";

export function LevelSection({ userStats }) {
  if (!userStats) return null;

  const level = userStats.level || 1;
  const experience = userStats.experience || 0;
  const experienceToNextLevel = userStats.experienceToNextLevel || 100;
  const totalExperience = userStats.totalExperience || 0;

  const progress = (experience / experienceToNextLevel) * 100;

  const rankTiers = [
    { name: "Bronze", minLevel: 1, icon: Star, color: "from-amber-700 to-amber-500" },
    { name: "Silver", minLevel: 5, icon: Trophy, color: "from-gray-400 to-gray-300" },
    { name: "Gold", minLevel: 10, icon: Crown, color: "from-yellow-400 to-yellow-300" },
    {
      name: "Platinum",
      minLevel: 15,
      icon: Target,
      color: "from-cyan-400 to-blue-300",
    },
    {
      name: "Diamond",
      minLevel: 20,
      icon: Zap,
      color: "from-purple-400 to-pink-300",
    },
  ];

  const getCurrentRank = (level) => {
    return [...rankTiers]
      .reverse()
      .find((tier) => level >= tier.minLevel);
  };

  const currentRank = getCurrentRank(level);
  const nextRank = rankTiers.find((tier) => level < tier.minLevel);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm p-6">
      {/* Current Level Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-16 w-16 rounded-xl bg-gradient-to-r ${currentRank.color} flex items-center justify-center shadow-lg`}
          >
            <currentRank.icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              Level {level}
              <span
                className={`text-sm font-medium bg-gradient-to-r ${currentRank.color} bg-clip-text text-transparent`}
              >
                {currentRank.name} Rank
              </span>
            </h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>{experience} / {experienceToNextLevel} XP</span>
              <span>•</span>
              <span>Total: {totalExperience} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2 bg-zinc-800" />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Level {level}</span>
          <span>Level {level + 1}</span>
        </div>
      </div>

      {/* Rank Progress */}
      {nextRank && (
        <div className="mt-6 p-4 rounded-lg bg-zinc-900/50">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Next Rank</h4>
          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-lg bg-gradient-to-r ${nextRank.color} flex items-center justify-center opacity-50`}
            >
              <nextRank.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{nextRank.name}</p>
              <p className="text-sm text-gray-400">
                {nextRank.minLevel - level} levels to unlock
              </p>
            </div>
          </div>
        </div>
      )}

      {/* XP Breakdown */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Activity Overview</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Daily Streak</span>
            </div>
            <p className="text-lg font-medium text-white">
              {userStats.dailyStreak || 0} days
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Achievements</span>
            </div>
            <p className="text-lg font-medium text-white">
              {userStats.unlockedAchievements?.length || 0} / {userStats.totalAchievements || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Study Sessions</span>
            </div>
            <p className="text-lg font-medium text-white">
              {userStats.studySessionsCompleted || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Active Days</span>
            </div>
            <p className="text-lg font-medium text-white">
              {userStats.totalActiveDays || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
