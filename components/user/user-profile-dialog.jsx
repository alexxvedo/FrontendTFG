"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, ChevronLeft } from "lucide-react";
import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { StatsSection } from "./profile/stats-section";
import { AchievementsSection } from "./profile/achievements-section";
import { ActivitySection } from "./profile/activity-section";
import { LevelSection } from "./profile/level-section";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

export function UserProfileDialog({ user, open, onOpenChange }) {
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  useEffect(() => {
    const getUserStats = api.userStats.getUserStats;

    async function fetchStats() {
      if (!user?.email) return;

      setIsLoading(true);
      setError(null);
      try {
        const stats = await getUserStats(user.email);
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setError("Failed to load user statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    if (open) {
      fetchStats();
    }
  }, [open, user?.email]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-[#0A0A0F]/95 border-zinc-800/50 backdrop-blur-xl shadow-2xl">
        <DialogTitle className="sr-only">User Profile</DialogTitle>
        <div className="relative h-full">
          {/* Header with user info */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-600/20 to-transparent pointer-events-none" />

          <div className="relative px-8 pt-6 pb-4 flex items-center justify-between border-b border-zinc-800/50">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-purple-500/20">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {user?.name}
                </h2>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg bg-zinc-900/90 p-2 text-gray-400 hover:text-white transition-colors hover:bg-zinc-800/90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ScrollArea className="h-[calc(90vh-5rem)]">
            <div className="p-8">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center h-[60vh]"
                  >
                    <div className="relative h-16 w-16">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-400/20 animate-pulse" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-purple-400 border-r-transparent border-b-blue-400 border-l-transparent animate-spin" />
                    </div>
                    <p className="mt-4 text-gray-400">
                      Loading your profile data...
                    </p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center h-[60vh] text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <X className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      Error Loading Data
                    </h3>
                    <p className="text-gray-400 max-w-md">{error}</p>
                    <button
                      onClick={() => {
                        if (open && user?.email) {
                          const getUserStats = api.userStats.getUserStats;
                          setIsLoading(true);
                          setError(null);
                          getUserStats(user.email)
                            .then((stats) => setUserStats(stats))
                            .catch((err) => {
                              console.error("Error retrying stats fetch:", err);
                              setError(
                                "Failed to load user statistics. Please try again later."
                              );
                            })
                            .finally(() => setIsLoading(false));
                        }
                      }}
                      className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white hover:from-purple-500/30 hover:to-blue-500/30 transition-colors border border-purple-500/20 hover:border-purple-500/30"
                    >
                      Try Again
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Level Section */}
                    <LevelSection userStats={userStats} />

                    {/* Main Content Tabs */}
                    <Tabs
                      defaultValue="stats"
                      value={activeTab}
                      onValueChange={(tab) => setActiveTab(tab)}
                      className="mt-8"
                    >
                      <TabsList className="w-full bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 p-1 rounded-xl border border-zinc-800/50">
                        <TabsTrigger
                          value="stats"
                          className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/20 data-[state=active]:to-blue-400/10 data-[state=active]:text-blue-400 rounded-lg transition-all duration-300"
                        >
                          Statistics
                        </TabsTrigger>
                        <TabsTrigger
                          value="achievements"
                          className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/20 data-[state=active]:to-purple-400/10 data-[state=active]:text-purple-400 rounded-lg transition-all duration-300"
                        >
                          Achievements
                        </TabsTrigger>
                        <TabsTrigger
                          value="activity"
                          className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600/20 data-[state=active]:to-pink-400/10 data-[state=active]:text-pink-400 rounded-lg transition-all duration-300"
                        >
                          Activity
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-6">
                        <AnimatePresence mode="wait">
                          <TabsContent value="stats">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <StatsSection userStats={userStats} />
                            </motion.div>
                          </TabsContent>
                          <TabsContent value="achievements">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <AchievementsSection
                                userStats={userStats}
                                onStatsUpdated={(updatedStats) => {
                                  setUserStats(updatedStats);
                                  if (user && user.email) {
                                    setIsLoading(true);
                                    api.userStats
                                      .getUserStats(user.email)
                                      .then((data) => {
                                        setUserStats(data);
                                        setError(null);
                                      })
                                      .catch((err) => {
                                        console.error(
                                          "Error fetching user stats:",
                                          err
                                        );
                                        setError(
                                          "Failed to load user statistics"
                                        );
                                      })
                                      .finally(() => {
                                        setIsLoading(false);
                                      });
                                  }
                                }}
                              />
                            </motion.div>
                          </TabsContent>
                          <TabsContent value="activity">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                            >
                              <ActivitySection user={user} />
                            </motion.div>
                          </TabsContent>
                        </AnimatePresence>
                      </div>
                    </Tabs>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
