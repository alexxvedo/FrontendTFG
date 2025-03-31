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
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();

  useEffect(() => {
    async function fetchStats() {
      if (!user?.email) return;
      
      setIsLoading(true);
      try {
        const stats = await api.userStats.getUserStats(user.email);
        setUserStats(stats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-zinc-900/95 border-zinc-800 backdrop-blur-xl">
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
              {/* Level Section */}
              <LevelSection userStats={userStats} />

              {/* Main Content Tabs */}
              <Tabs defaultValue="stats" className="mt-8">
                <TabsList className="w-full bg-zinc-800/50 p-1 sticky top-0 z-10">
                  <TabsTrigger
                    value="stats"
                    className="flex-1 data-[state=active]:bg-zinc-700/50"
                  >
                    Statistics
                  </TabsTrigger>
                  <TabsTrigger
                    value="achievements"
                    className="flex-1 data-[state=active]:bg-zinc-700/50"
                  >
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="flex-1 data-[state=active]:bg-zinc-700/50"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="collections"
                    className="flex-1 data-[state=active]:bg-zinc-700/50"
                  >
                    Collections
                  </TabsTrigger>
                  <TabsTrigger
                    value="workspaces"
                    className="flex-1 data-[state=active]:bg-zinc-700/50"
                  >
                    Workspaces
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="stats">
                    <StatsSection userStats={userStats} />
                  </TabsContent>
                  <TabsContent value="achievements">
                    <AchievementsSection userStats={userStats} />
                  </TabsContent>
                  <TabsContent value="activity">
                    <ActivitySection user={user} />
                  </TabsContent>
                  <TabsContent value="collections">
                    <CollectionsSection userStats={userStats} />
                  </TabsContent>
                  <TabsContent value="workspaces">
                    <WorkspacesSection userStats={userStats} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
