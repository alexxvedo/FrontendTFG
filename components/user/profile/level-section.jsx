"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Brain, Target, Crown } from "lucide-react";

const RANKS = [
  {
    name: "Novice",
    minLevel: 1,
    color: "blue",
    icon: Star,
    description: "Just starting your learning journey",
  },
  {
    name: "Scholar",
    minLevel: 5,
    color: "green",
    icon: Brain,
    description: "Building a solid foundation of knowledge",
  },
  {
    name: "Expert",
    minLevel: 10,
    color: "purple",
    icon: Target,
    description: "Mastering advanced concepts",
  },
  {
    name: "Master",
    minLevel: 15,
    color: "orange",
    icon: Zap,
    description: "A true knowledge seeker",
  },
  {
    name: "Legend",
    minLevel: 20,
    color: "yellow",
    icon: Crown,
    description: "Among the greatest learners",
  },
];

function getCurrentRank(level) {
  return [...RANKS].reverse().find((rank) => level >= rank.minLevel);
}

function getNextRank(level) {
  return RANKS.find((rank) => level < rank.minLevel);
}

export function LevelSection({ userStats }) {
  if (!userStats) return null;

  const level = userStats.level || 1;
  const xp = userStats.xp || 0;
  const xpForNextLevel = Math.pow(level * 100, 1.2);
  const progress = (xp / xpForNextLevel) * 100;

  const currentRank = getCurrentRank(level);
  const nextRank = getNextRank(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />

      <div className="relative p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Level Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br from-${currentRank.color}-500/20 to-${currentRank.color}-400/10 flex items-center justify-center`}
                >
                  <currentRank.icon
                    className={`w-8 h-8 text-${currentRank.color}-400`}
                  />
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ring-2 ring-[#0A0A0F]"
                >
                  {level}
                </motion.div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Level {level}
                  </h3>
                  <span
                    className={`text-sm font-medium text-${currentRank.color}-400 bg-${currentRank.color}-500/10 px-2 py-0.5 rounded-full`}
                  >
                    {currentRank.name} Rank
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {currentRank.description}
                </p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Progress to Level {level + 1}
                </span>
                <span className="text-purple-400 font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="relative h-4">
                <div className="absolute inset-0 bg-zinc-800/50 rounded-full" />
                <Progress
                  value={progress}
                  className="h-4 relative z-10"
                  indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                />
                {/* XP Milestones */}
                {[25, 50, 75].map((milestone) => (
                  <div
                    key={milestone}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${milestone}%` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-zinc-700 ring-4 ring-[#0A0A0F]" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{xp} XP</span>
                <span>{Math.round(xpForNextLevel)} XP</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/10"
              >
                <Star className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">{xp}</p>
                <p className="text-sm text-gray-400">Total XP</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10"
              >
                <Trophy className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {userStats.achievements?.length || 0}
                </p>
                <p className="text-sm text-gray-400">Achievements</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/10"
              >
                <Brain className="w-5 h-5 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {userStats.studySessionsCompleted || 0}
                </p>
                <p className="text-sm text-gray-400">Sessions</p>
              </motion.div>
            </div>
          </div>

          {/* Next Rank Preview */}
          {nextRank && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-transparent border border-zinc-800/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-2xl" />
              <div className="relative">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Next Rank
                </h4>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${nextRank.color}-500/20 to-${nextRank.color}-400/10 flex items-center justify-center`}
                  >
                    <nextRank.icon
                      className={`w-6 h-6 text-${nextRank.color}-400`}
                    />
                  </div>
                  <div>
                    <h5 className={`font-medium text-${nextRank.color}-400`}>
                      {nextRank.name}
                    </h5>
                    <p className="text-sm text-gray-400">
                      {nextRank.minLevel - level} levels to unlock
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{nextRank.description}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
