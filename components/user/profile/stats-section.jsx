"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Brain,
  Target,
  BookOpen,
  Users,
  Star,
  Trophy,
  Flame,
  ChartBar,
  Calendar,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

function StatCard({ icon: Icon, label, value, description, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 rounded-2xl bg-gradient-to-br from-${color}-500/10 to-transparent border border-${color}-500/10`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <div>
          <h3 className="font-medium text-white">{label}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function ProgressSection({ label, value, total, icon: Icon, color }) {
  const percentage = Math.round((value / total) * 100) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 text-${color}-400`} />
          <span className="text-sm text-gray-400">{label}</span>
        </div>
        <span className="text-sm font-medium text-white">
          {value} / {total}
        </span>
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 bg-zinc-800/50 rounded-full" />
        <Progress
          value={percentage}
          className="h-2 relative z-10"
          indicatorClassName={`bg-gradient-to-r from-${color}-500 to-${color}-400`}
        />
      </div>
    </motion.div>
  );
}

export function StatsSection({ userStats }) {
  if (!userStats) return null;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateAccuracy = () => {
    const correct = userStats.correctAnswers || 0;
    const total = userStats.totalAnswers || 0;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={Clock}
          label="Total Study Time"
          value={formatTime(userStats.studySeconds || 0)}
          description="Time invested in learning"
          color="purple"
          delay={0.1}
        />
        <StatCard
          icon={Brain}
          label="Cards Studied"
          value={userStats.studiedFlashcards || 0}
          description="Total flashcards reviewed"
          color="blue"
          delay={0.2}
        />
        <StatCard
          icon={Target}
          label="Accuracy Rate"
          value={`${calculateAccuracy()}%`}
          description="Correct answers percentage"
          color="green"
          delay={0.3}
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${userStats.dailyStreak || 0} days`}
          description="Consecutive study days"
          color="orange"
          delay={0.4}
        />
      </div>

      {/* Progress Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Learning Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-zinc-800/50 to-transparent border border-zinc-800/30 space-y-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Learning Progress
            </h3>
            <ChartBar className="w-5 h-5 text-purple-400" />
          </div>

          <ProgressSection
            label="Daily Goal"
            value={userStats.dailyGoalProgress || 0}
            total={userStats.dailyGoalTarget || 100}
            icon={Target}
            color="purple"
          />

          <ProgressSection
            label="Weekly Target"
            value={userStats.weeklyProgress || 0}
            total={userStats.weeklyTarget || 500}
            icon={Calendar}
            color="blue"
          />

          <ProgressSection
            label="Mastery Level"
            value={userStats.masteredCards || 0}
            total={userStats.totalCards || 0}
            icon={Star}
            color="yellow"
          />
        </motion.div>

        {/* Achievement Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-zinc-800/50 to-transparent border border-zinc-800/30"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Achievement Stats
            </h3>
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/10">
                <CheckCircle className="w-5 h-5 text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {userStats.completedSessions || 0}
                </p>
                <p className="text-sm text-gray-400">Sessions</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/10">
                <BookOpen className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">
                  {userStats.createdFlashcards || 0}
                </p>
                <p className="text-sm text-gray-400">Created</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Study Groups</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {userStats.studyGroups || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Best Streak</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {userStats.bestStreak || 0} days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Perfect Scores</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {userStats.perfectScores || 0}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
