"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  Clock,
  Flame,
  Trophy,
  Target,
  Sparkles,
  Users,
  Star,
  Zap,
  BarChart,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function StatsSection({ userStats }) {
  if (!userStats) return null;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  // Safely access properties with fallbacks
  const studySeconds = userStats?.studySeconds || 0;
  const createdFlashcards = userStats?.createdFlashcards || 0;
  const studiedFlashcards = userStats?.studiedFlashcards || 0;
  const dailyStreak = userStats?.dailyStreak || 0;
  const unlockedAchievements = userStats?.unlockedAchievements || [];
  const totalAchievements = userStats?.totalAchievements || 0;
  const averageAccuracy = userStats?.averageAccuracy || 0;
  const activeCollections = userStats?.activeCollections || 0;
  const totalCollections = userStats?.totalCollections || 0;
  const activeWorkspaces = userStats?.activeWorkspaces || 0;
  const totalWorkspaces = userStats?.totalWorkspaces || 0;

  const mainStats = [
    {
      icon: Clock,
      label: "Study Time",
      value: formatTime(studySeconds),
      color: "from-blue-400 to-cyan-400",
    },
    {
      icon: BookOpen,
      label: "Created Cards",
      value: createdFlashcards,
      color: "from-purple-400 to-pink-400",
    },
    {
      icon: Brain,
      label: "Cards Studied",
      value: studiedFlashcards,
      color: "from-green-400 to-emerald-400",
    },
    {
      icon: Flame,
      label: "Day Streak",
      value: dailyStreak,
      color: "from-orange-400 to-red-400",
    },
  ];

  const additionalStats = [
    {
      icon: Trophy,
      label: "Achievements",
      value: `${unlockedAchievements.length} / ${totalAchievements}`,
      color: "from-yellow-400 to-amber-400",
    },
    {
      icon: Target,
      label: "Avg. Accuracy",
      value: `${Math.round(averageAccuracy)}%`,
      color: "from-red-400 to-rose-400",
    },
    {
      icon: Sparkles,
      label: "Collections",
      value: `${activeCollections} / ${totalCollections}`,
      color: "from-indigo-400 to-violet-400",
    },
    {
      icon: Users,
      label: "Workspaces",
      value: `${activeWorkspaces} / ${totalWorkspaces}`,
      color: "from-teal-400 to-emerald-400",
    },
  ];

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  // Get today's stats only for daily goals
  const todayStudiedCards = userStats?.todayStudiedCards || 0;
  const todayStudyMinutes = userStats?.todayStudyMinutes || 0;
  const todayAccuracy = userStats?.todayAccuracy || 0;
  
  const dailyGoals = [
    {
      icon: Brain,
      label: "Daily Cards",
      current: todayStudiedCards,
      target: 10, // More realistic daily target
      color: "from-blue-400 to-cyan-400",
    },
    {
      icon: Clock,
      label: "Daily Study Time",
      current: todayStudyMinutes,
      target: 15, // More realistic daily target (15 minutes)
      color: "from-purple-400 to-pink-400",
      format: (value) => `${value}min`,
    },
    {
      icon: Target,
      label: "Daily Accuracy",
      current: Math.round(todayAccuracy),
      target: 100,
      color: "from-yellow-400 to-amber-400",
      format: (value) => `${value}%`,
    },
  ];

  // No longer using best subjects

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Daily Goals Section */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm p-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-400" />
          Daily Goals
        </h3>
        <div className="space-y-4">
          {dailyGoals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <goal.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{goal.label}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {goal.format
                    ? goal.format(goal.current)
                    : goal.current}{" "}
                  / {goal.format ? goal.format(goal.target) : goal.target}
                </span>
              </div>
              <Progress
                value={calculateProgress(goal.current, goal.target)}
                className="h-2 bg-zinc-800"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Best Subjects section removed */}

      {/* Additional Stats */}
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-purple-400" />
          Additional Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {additionalStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2 items-center text-center">
          <div
            className={`h-12 w-12 rounded-xl bg-gradient-to-r ${color} bg-opacity-10 flex items-center justify-center`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <p
              className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
            >
              {value}
            </p>
            <span className="text-sm text-gray-400 block">{label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
