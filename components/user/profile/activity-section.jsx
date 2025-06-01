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
  Layers,
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
  const [allTimeStats, setAllTimeStats] = useState({
    studyTime: "0h 0m",
    cardsStudied: 0,
    accuracy: "0%",
    daysActive: 0,
    totalStudySessions: 0,
  });

  useEffect(() => {
    // Store references to API functions to avoid dependency issues
    const getRecentActivity = api.userActivity.getRecentActivity;
    const getWeeklyStats = api.userActivity.getWeeklyStats;
    const getMonthlyStats = api.userActivity.getMonthlyStats;

    const loadActivityData = async () => {
      try {
        if (!user?.id) return;

        const [activities, weekly, monthly] = await Promise.all([
          getRecentActivity(user.id),
          getWeeklyStats(user.id),
          getMonthlyStats(user.id),
        ]);

        // Process activity data - Group by collection and type
        const processedActivities = [];
        const studySessionsByCollection = {};

        if (Array.isArray(activities)) {
          // First pass: group study sessions by collection and date
          activities.forEach((activity) => {
            // Skip individual flashcard activities completely
            if (activity.type === "study") {
              // Extract collection info
              const collectionId = activity.collectionId || "unknown";
              const collectionName = activity.collectionName || "Collection";
              const dateKey = activity.timestamp
                ? activity.timestamp.split("T")[0]
                : new Date().toISOString().split("T")[0];

              // Create a unique key for this collection+date combination
              const key = `${collectionId}-${dateKey}`;

              // If we don't have a session for this collection+date yet, create one
              if (!studySessionsByCollection[key]) {
                studySessionsByCollection[key] = {
                  type: "study",
                  title: `Study Session: ${collectionName}`,
                  description: `Studied flashcards in ${collectionName}`,
                  timestamp: activity.timestamp,
                  time: activity.time || "1h ago",
                  stats: {
                    studyTimeInSeconds: 0,
                    cardsStudied: 0,
                    accuracy: 0,
                  },
                  collectionId,
                  collectionName,
                };
              }

              // Accumulate stats
              if (activity.stats) {
                studySessionsByCollection[key].stats.studyTimeInSeconds +=
                  activity.stats.studyTimeInSeconds || 0;
                studySessionsByCollection[key].stats.cardsStudied =
                  (studySessionsByCollection[key].stats.cardsStudied || 0) + 1;
              }
            } else if (
              activity.type === "achievement" ||
              activity.type === "streak"
            ) {
              // Non-study activities like achievements and streaks pass through
              processedActivities.push(activity);
            }
          });

          // Add the grouped study sessions to processed activities
          Object.values(studySessionsByCollection).forEach((session) => {
            processedActivities.push(session);
          });

          // Sort by timestamp (newest first)
          processedActivities.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
        }

        // Add icons and colors
        processedActivities.forEach((activity) => {
          // Set icon based on type
          if (activity.type === "study") {
            // Generate a consistent color based on collection ID
            const collectionId = activity.collectionId || "default";
            const colorOptions = [
              {
                name: "blue",
                textClass: "text-blue-400",
                bgClass: "bg-blue-400/10",
              },
              {
                name: "purple",
                textClass: "text-purple-400",
                bgClass: "bg-purple-400/10",
              },
              {
                name: "pink",
                textClass: "text-pink-400",
                bgClass: "bg-pink-400/10",
              },
              {
                name: "indigo",
                textClass: "text-indigo-400",
                bgClass: "bg-indigo-400/10",
              },
              {
                name: "cyan",
                textClass: "text-cyan-400",
                bgClass: "bg-cyan-400/10",
              },
            ];

            // Use a hash function to pick a consistent color for each collection
            const hashCode = (str) => {
              let hash = 0;
              for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
              }
              return Math.abs(hash);
            };

            const colorIndex = hashCode(collectionId) % colorOptions.length;
            const colorOption = colorOptions[colorIndex];

            // Update title to include collection name
            if (activity.collectionName) {
              activity.title = `Study Session: ${activity.collectionName}`;
              activity.description = `Studied flashcards in ${activity.collectionName}`;
            }

            activity.icon = (
              <BookOpen className={`h-5 w-5 ${colorOption.textClass}`} />
            );
            activity.color = colorOption.name;
            activity.bgColorClass = colorOption.bgClass;
            activity.textColorClass = colorOption.textClass;
          } else if (activity.type === "achievement") {
            activity.icon = <Trophy className="h-5 w-5 text-yellow-400" />;
            activity.color = "yellow";
            activity.bgColorClass = "bg-yellow-400/10";
            activity.textColorClass = "text-yellow-400";
          } else if (activity.type === "streak") {
            activity.icon = <Flame className="h-5 w-5 text-orange-400" />;
            activity.color = "orange";
            activity.bgColorClass = "bg-orange-400/10";
            activity.textColorClass = "text-orange-400";
          } else {
            activity.icon = <Clock className="h-5 w-5 text-gray-400" />;
            activity.color = "gray";
            activity.bgColorClass = "bg-gray-400/10";
            activity.textColorClass = "text-gray-400";
          }
        });

        setRecentActivities(processedActivities);

        // Process weekly stats
        const processedWeekly = weekly || {
          studyTime: "0h 0m",
          cardsStudied: 0,
          accuracy: "0%",
          daysActive: 0,
          heatmap: [],
        };
        setWeeklyStats(processedWeekly);

        // Process monthly stats
        const processedMonthly = monthly || {
          studyTime: "0h 0m",
          cardsStudied: 0,
          accuracy: "0%",
          daysActive: 0,
          heatmap: [],
        };
        setMonthlyStats(processedMonthly);

        // Calculate all-time stats
        // This would ideally come from the API, but we'll calculate it here for now
        const totalStudySessions = Object.keys(
          studySessionsByCollection
        ).length;
        const allTimeActiveSet = new Set();

        // Combine active days from weekly and monthly
        if (processedWeekly.heatmap) {
          processedWeekly.heatmap.forEach((day) => {
            if (day.minutesStudied > 0) {
              allTimeActiveSet.add(day.day);
            }
          });
        }

        if (processedMonthly.heatmap) {
          processedMonthly.heatmap.forEach((day) => {
            if (day.minutesStudied > 0) {
              allTimeActiveSet.add(`${day.day}-${day.dayOfMonth}`);
            }
          });
        }

        // Create all-time stats object
        setAllTimeStats({
          studyTime: processedMonthly.studyTime || "0h 0m",
          cardsStudied: processedMonthly.cardsStudied || 0,
          accuracy: processedMonthly.accuracy || "0%",
          daysActive: allTimeActiveSet.size,
          totalStudySessions,
        });
      } catch (error) {
        console.error("Error loading activity data:", error);
      }
    };

    loadActivityData();

    // Only depend on user.id to prevent infinite loops
  }, [user?.id]);

  // Function to render the heatmap
  const renderHeatmap = (stats, isMonthly = false) => (
    <div className="space-y-2 w-full">
      {[0, 1, 2, 3].map((week) => (
        <div key={week} className="flex space-x-2">
          {stats.heatmap.slice(week * 7, week * 7 + 7).map((day, index) => (
            <HoverCard key={index} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div className="flex flex-col items-center space-y-1 cursor-pointer">
                  <div
                    className={`h-8 w-8 rounded-md ${
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

  // Function to render stats
  const renderStats = (stats, isAllTime = false) => (
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
          {stats.daysActive}
          {isAllTime ? "" : `/${stats === weeklyStats ? "7" : "30"}`}
        </p>
      </div>
      {isAllTime && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">Study Sessions</span>
          </div>
          <p className="text-xl font-bold text-white">
            {stats.totalStudySessions}
          </p>
        </div>
      )}
    </div>
  );

  // Component to render a single activity item
  function ActivityItem({ activity }) {
    // Default color classes if not provided
    const bgColorClass = activity.bgColorClass || `bg-${activity.color}-500/10`;
    const textColorClass =
      activity.textColorClass || `text-${activity.color}-400`;

    return (
      <div className="flex items-start space-x-4 p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/80 transition-colors">
        <div className={`p-2 rounded-full ${bgColorClass}`}>
          {typeof activity.icon === "function" ? (
            <activity.icon className={`h-5 w-5 ${textColorClass}`} />
          ) : (
            activity.icon
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-white truncate">
              {activity.title}
            </p>
            <span className="text-xs text-gray-400">{activity.time}</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{activity.description}</p>

          {activity.stats && (
            <div className="flex items-center mt-2 space-x-4">
              {activity.stats.studyTimeInSeconds > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {Math.floor(activity.stats.studyTimeInSeconds / 60)}m
                  </span>
                </div>
              )}

              {activity.stats.cardsStudied > 0 && (
                <div className="flex items-center space-x-1">
                  <Layers className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {activity.stats.cardsStudied} cards
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <div className="p-4 rounded-lg bg-zinc-800/50 text-center">
              <p className="text-gray-400">No recent activity</p>
            </div>
          ) : (
            recentActivities
              .slice(0, 5)
              .map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
          )}
        </div>
      </div>

      <div>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="w-full bg-zinc-800 p-1">
            <TabsTrigger
              value="weekly"
              className="flex-1 data-[state=active]:bg-blue-900/20"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="flex-1 data-[state=active]:bg-purple-900/20"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="alltime"
              className="flex-1 data-[state=active]:bg-pink-900/20"
            >
              All Time
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="weekly" className="space-y-6">
              {renderStats(weeklyStats)}
              <div>
                <h4 className="text-md font-medium text-white mb-4">
                  Weekly Activity
                </h4>
                {renderHeatmap(weeklyStats)}
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              {renderStats(monthlyStats)}
              <div>
                <h4 className="text-md font-medium text-white mb-4">
                  Monthly Activity
                </h4>
                {renderHeatmap(monthlyStats, true)}
              </div>
            </TabsContent>

            <TabsContent value="alltime" className="space-y-6">
              {renderStats(allTimeStats, true)}
              <div>
                <h4 className="text-md font-medium text-white mb-4">
                  All Time Statistics
                </h4>
                <div className="p-4 rounded-lg bg-zinc-800/50">
                  <p className="text-gray-400">
                    Your lifetime statistics show your progress since you
                    started using the platform.
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
