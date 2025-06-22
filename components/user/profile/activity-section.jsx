"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  BookOpen,
  Brain,
  Target,
  Flame,
  Trophy,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { subDays, format, isSameDay } from "date-fns";

function ActivityCalendar({ data = {} }) {
  const today = new Date();
  const days = Array.from({ length: 120 }, (_, i) => subDays(today, i));

  const getActivityLevel = (date) => {
    if (!data) return 0;
    const dateStr = date.toISOString().split("T")[0];
    const activity = data[dateStr] || 0;
    if (activity === 0) return 0;
    if (activity < 30) return 1;
    if (activity < 60) return 2;
    if (activity < 120) return 3;
    return 4;
  };

  const getLevelColor = (level) => {
    const colors = [
      "bg-zinc-800",
      "bg-purple-900/50",
      "bg-purple-700/50",
      "bg-purple-500/50",
      "bg-purple-400/50",
    ];
    return colors[level];
  };

  const formatTooltipDate = (date) => {
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="grid grid-cols-12 gap-1">
      {days.map((date, i) => (
        <motion.div
          key={date.toISOString()}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.005 }}
          className="relative group"
        >
          <div
            className={`w-full pt-[100%] rounded-sm ${getLevelColor(
              getActivityLevel(date)
            )} transition-colors duration-200 hover:ring-2 hover:ring-purple-500/50`}
            title={`${formatTooltipDate(date)}: ${
              data?.[date.toISOString().split("T")[0]] || 0
            } minutes`}
          />
          {isSameDay(date, today) && (
            <div className="absolute inset-0 ring-2 ring-purple-400 rounded-sm" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function ActivityMetric({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl bg-gradient-to-br from-${color}-500/10 to-transparent border border-${color}-500/10`}
    >
      <Icon className={`w-5 h-5 text-${color}-400 mb-2`} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
}

export function ActivitySection({ user }) {
  const [activityData, setActivityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  useEffect(() => {
    async function fetchActivityData() {
      if (!user?.email) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await api.userActivity.getRecentActivity(user.email);
        setActivityData(data);
      } catch (error) {
        console.error("Error fetching activity data:", error);
        setError("Failed to load activity data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivityData();
  }, [user?.email]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-[200px]"
      >
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-400 border-r-transparent border-b-blue-400 border-l-transparent animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[200px] text-center"
      >
        <p className="text-red-400 mb-2">Error: {error}</p>
        <button
          onClick={() => {
            if (user?.email) {
              setIsLoading(true);
              setError(null);
              api.userActivity
                .getRecentActivity(user.email)
                .then((data) => setActivityData(data))
                .catch((err) => setError("Failed to load activity data"))
                .finally(() => setIsLoading(false));
            }
          }}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white hover:from-purple-500/30 hover:to-blue-500/30 transition-colors border border-purple-500/20 hover:border-purple-500/30"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!activityData) return null;

  const {
    totalStudyTime,
    averageSessionLength,
    totalSessions,
    currentStreak,
    bestStreak,
    activityHeatmap,
    completionRate,
  } = activityData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Activity Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ActivityMetric
          icon={Clock}
          label="Total Study Time"
          value={`${Math.round(totalStudyTime / 60)}h`}
          color="purple"
        />
        <ActivityMetric
          icon={Brain}
          label="Avg. Session"
          value={`${Math.round(averageSessionLength)}m`}
          color="blue"
        />
        <ActivityMetric
          icon={Target}
          label="Completion Rate"
          value={`${Math.round(completionRate)}%`}
          color="green"
        />
        <ActivityMetric
          icon={Flame}
          label="Current Streak"
          value={`${currentStreak}d`}
          color="orange"
        />
      </div>

      {/* Activity Calendar */}
      <div className="p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Activity Calendar
            </h3>
            <p className="text-sm text-gray-400">
              Your study activity over time
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-zinc-800/50" />
              <div className="w-3 h-3 rounded-sm bg-purple-900/50" />
              <div className="w-3 h-3 rounded-sm bg-purple-700/50" />
              <div className="w-3 h-3 rounded-sm bg-purple-500/50" />
              <div className="w-3 h-3 rounded-sm bg-purple-300/50" />
            </div>
            <span>More</span>
          </div>
        </div>
        <ActivityCalendar data={activityHeatmap} />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Best Achievements</h3>
              <p className="text-sm text-gray-400">Your top milestones</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Best Study Streak</span>
              <span className="font-medium text-yellow-400">
                {bestStreak} days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Sessions</span>
              <span className="font-medium text-yellow-400">
                {totalSessions}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Star className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Recent Activity</h3>
              <p className="text-sm text-gray-400">
                Your latest study sessions
              </p>
            </div>
          </div>
          {/* Add recent activity list here */}
        </motion.div>
      </div>
    </motion.div>
  );
}
