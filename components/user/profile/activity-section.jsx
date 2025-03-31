"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Portal } from "@radix-ui/react-portal";
import {
  Calendar,
  Clock,
  Medal,
  Target,
  Trophy,
  Users,
  BookOpen,
  Brain,
  Star,
  Flame,
} from "lucide-react";
import { useApi } from "@/lib/api";

export function ActivitySection({ user }) {
  const api = useApi();
  const [recentActivities, setRecentActivities] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    studyTime: "0h 0m",
    cardsStudied: 0,
    accuracy: "0%",
    daysActive: 0,
    heatmap: [],
  });
  const [monthlyStats, setMonthlyStats] = useState({
    studyTime: "0h 0m",
    cardsStudied: 0,
    accuracy: "0%",
    daysActive: 0,
    heatmap: [],
  });

  useEffect(() => {
    const loadActivityData = async () => {
      try {
        const [activities, weekly, monthly] = await Promise.all([
          api.userActivity.getRecentActivity(user.id),
          api.userActivity.getWeeklyStats(user.id),
          api.userActivity.getMonthlyStats(user.id),
        ]);

        setRecentActivities(
          activities.map((activity) => {
            let icon, color;
            switch (activity.type) {
              case "study":
                icon = Brain;
                color = "text-blue-400";
                break;
              case "achievement":
                icon = Trophy;
                color = "text-yellow-400";
                break;
              case "streak":
                icon = Flame;
                color = "text-orange-400";
                break;
              default:
                icon = BookOpen;
                color = "text-purple-400";
            }
            return { ...activity, icon, color };
          })
        );

        setWeeklyStats(weekly);
        setMonthlyStats(monthly);
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    };

    if (user?.id) {
      loadActivityData();
    }
  }, [user?.id]);

  const renderHeatmap = (stats, isMonthly = false) => {
    if (!stats.heatmap) return null;

    const heatmap = isMonthly
      ? Array.from({ length: Math.ceil(stats.heatmap.length / 7) }, (_, i) =>
          stats.heatmap.slice(i * 7, (i + 1) * 7)
        )
      : [stats.heatmap];

    return (
      <div className="space-y-2">
        {heatmap.map((week, weekIndex) => (
          <div key={weekIndex} className="flex justify-between gap-2">
            {week.map((day, dayIndex) => (
              <HoverCard key={dayIndex} openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div className="flex-1 text-center cursor-pointer">
                    <div
                      className={`h-8 rounded-md mb-1 ${
                        day.intensity === 0
                          ? "bg-zinc-800"
                          : day.intensity === 1
                          ? "bg-green-900/30"
                          : day.intensity === 2
                          ? "bg-green-800/40"
                          : "bg-green-700/50"
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {isMonthly ? day.dayOfMonth : day.day}
                    </span>
                  </div>
                </HoverCardTrigger>
                <Portal>
                  <HoverCardContent
                    side="top"
                    align="center"
                    className="w-80 bg-zinc-900/90 backdrop-blur-sm border-zinc-800 z-[9999]"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-400" />
                        <h4 className="text-sm font-medium text-white">
                          {day.day} {isMonthly ? `(${day.dayOfMonth})` : ""}
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-gray-400">
                              Study Time
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">
                            {day.minutesStudied} min
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Brain className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-gray-400">Cards</span>
                          </div>
                          <p className="text-sm font-medium text-white">
                            {day.cardsStudied}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-gray-400">
                              Accuracy
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">
                            {Math.round(day.accuracy)}%
                          </p>
                        </div>
                        {day.achievements && day.achievements.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-3 w-3 text-amber-400" />
                              <span className="text-xs text-gray-400">
                                Achievements
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {day.achievements.map((achievement, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs bg-amber-500/10 border-amber-500/20 text-amber-400"
                                >
                                  {achievement}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </HoverCardContent>
                </Portal>
              </HoverCard>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderStats = (stats) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-gray-400">Study Time</span>
        </div>
        <p className="text-xl font-bold text-white">{stats.studyTime}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">Cards Studied</span>
        </div>
        <p className="text-xl font-bold text-white">{stats.cardsStudied}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-gray-400">Accuracy</span>
        </div>
        <p className="text-xl font-bold text-white">{stats.accuracy}</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-pink-400" />
          <span className="text-sm text-gray-400">Days Active</span>
        </div>
        <p className="text-xl font-bold text-white">
          {stats.daysActive}/{stats === weeklyStats ? "7" : "30"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm p-6">
        <Tabs defaultValue="weekly" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Activity Overview
            </h3>
            <TabsList className="bg-zinc-900/50">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weekly" className="space-y-6">
            {renderStats(weeklyStats)}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Weekly Activity
              </h4>
              {renderHeatmap(weeklyStats)}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            {renderStats(monthlyStats)}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                Monthly Activity
              </h4>
              {renderHeatmap(monthlyStats, true)}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-400" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-lg bg-zinc-700/50 flex items-center justify-center`}
                >
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                  {activity.type === "study" && activity.stats && (
                    <div className="mt-3 flex gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {Math.round(activity.stats.studyTimeInSeconds / 60)}
                          min
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {activity.stats.result}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
