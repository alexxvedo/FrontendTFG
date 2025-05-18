"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { StatsSection } from "./profile/stats-section";
import { AchievementsSection } from "./profile/achievements-section";
import { ActivitySection } from "./profile/activity-section";
import { LevelSection } from "./profile/level-section";
import { CollectionsSection } from "./profile/collections-section";
import { WorkspacesSection } from "./profile/workspaces-section";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UserProfileDialog({ user, open, onOpenChange }) {
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  useEffect(() => {
    // Create a reference to the api function to avoid dependency issues
    const getUserStats = api.userStats.getUserStats;
    
    async function fetchStats() {
      if (!user?.email) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const stats = await getUserStats(user.email);
        console.log('Fetched user stats:', stats);
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-[#0A0A0F]/95 border-zinc-800 backdrop-blur-xl">
        <DialogTitle className="sr-only">User Profile</DialogTitle>
        <div className="relative h-full">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-50 rounded-lg bg-zinc-900/90 p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <ScrollArea className="h-[90vh]">
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <div className="h-12 w-12 rounded-full border-4 border-t-blue-400 border-r-transparent border-b-purple-400 border-l-transparent animate-spin"></div>
                  <p className="mt-4 text-gray-400">Loading user statistics...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                  <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Error Loading Data</h3>
                  <p className="text-gray-400 max-w-md">{error}</p>
                  <button 
                    onClick={() => {
                      if (open && user?.email) {
                        // Store reference to avoid dependency issues
                        const getUserStats = api.userStats.getUserStats;
                        
                        setIsLoading(true);
                        setError(null);
                        getUserStats(user.email)
                          .then(stats => setUserStats(stats))
                          .catch(err => {
                            console.error("Error retrying stats fetch:", err);
                            setError("Failed to load user statistics. Please try again later.");
                          })
                          .finally(() => setIsLoading(false));
                      }
                    }}
                    className="mt-4 px-4 py-2 rounded-md bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* Level Section */}
                  <LevelSection userStats={userStats} />
                  {/* AchievementsSection moved to TabsContent */}
                  {/* Main Content Tabs */}
                  <Tabs 
                    defaultValue="stats" 
                    value={activeTab} 
                    onValueChange={(tab) => setActiveTab(tab)} 
                    className="mt-8"
                  >
                    <TabsList className="w-full bg-zinc-800 p-1 sticky top-0 z-10">
                      <TabsTrigger
                        value="stats"
                        className="flex-1 data-[state=active]:bg-blue-900/20"
                      >
                        Statistics
                      </TabsTrigger>
                      <TabsTrigger
                        value="achievements"
                        className="flex-1 data-[state=active]:bg-purple-900/20"
                      >
                        Achievements
                      </TabsTrigger>
                      <TabsTrigger
                        value="activity"
                        className="flex-1 data-[state=active]:bg-pink-900/20"
                      >
                        Activity
                      </TabsTrigger>
                      {/* Collections and Workspaces tabs removed */}
                    </TabsList>

                    <div className="mt-6">
                      <TabsContent value="stats">
                        <StatsSection userStats={userStats} />
                      </TabsContent>
                      <TabsContent value="achievements">
                        <AchievementsSection 
                          userStats={userStats} 
                          onStatsUpdated={(updatedStats) => {
                            setUserStats(updatedStats);
                            // Refetch stats to ensure we have the latest data
                            if (user && user.email) {
                              setIsLoading(true);
                              api.userStats.getUserStats(user.email)
                                .then(data => {
                                  setUserStats(data);
                                  setError(null);
                                })
                                .catch(err => {
                                  console.error("Error fetching user stats:", err);
                                  setError("Failed to load user statistics");
                                })
                                .finally(() => {
                                  setIsLoading(false);
                                });
                            }
                          }}
                        />
                      </TabsContent>
                      <TabsContent value="activity">
                        <ActivitySection user={user} />
                      </TabsContent>
                      {/* Collections and Workspaces tabs content removed */}
                    </div>
                  </Tabs>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
