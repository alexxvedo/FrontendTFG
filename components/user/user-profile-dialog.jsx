"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Brain,
  Calendar,
  Clock,
  GraduationCap,
  Medal,
  Star,
  Trophy,
  Users,
} from "lucide-react";

import { useApi } from "@/lib/api";

export function UserProfileDialog({ isOpen, onClose, user }) {
  // Datos de ejemplo - En una implementación real, estos vendrían de la base de datos
  const stats = {
    studyTime: "47h 23m",
    flashcardsCreated: 342,
    collectionsCreated: 15,
    studySessions: 89,
    joinDate: "Feb 2024",
    streak: 7,
    collaborators: 12,
    achievements: [
      { name: "Early Adopter", icon: Star },
      { name: "Study Streak: 7 days", icon: Trophy },
      { name: "Knowledge Master", icon: Brain },
    ],
  };
  const [userStats, setUserStats] = useState(null);

  const api = useApi();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.userStats.getUserStats(user.email);
        console.log("User stats: ", response);
        setUserStats(response);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };
    fetchUserStats();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] p-0 gap-0 bg-zinc-900/95 border border-purple-500/20 backdrop-blur-sm shadow-lg">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Profile
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          {/* Hero Section */}
          <div className="relative">
            <div className="h-40 bg-gradient-to-r from-blue-900/80 via-purple-900/80 to-pink-900/80 relative overflow-hidden">
              {/* Animated orbs */}
              <div className="absolute top-[10%] left-[20%] w-32 h-32 bg-blue-600/30 rounded-full blur-3xl animate-float-slow"></div>
              <div className="absolute bottom-[10%] right-[30%] w-40 h-40 bg-purple-600/30 rounded-full blur-3xl animate-float-slow-reverse"></div>
            </div>
            <Avatar className="absolute -bottom-12 left-6 h-24 w-24 border-4 border-zinc-900 shadow-lg">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="px-6 pt-14 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {user.name}
                </h2>
                <p className="text-gray-400">{user.email}</p>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none shadow-md flex items-center gap-1 px-3 py-1">
                <GraduationCap className="h-4 w-4" />
                Pro Member
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <StatCard
                icon={Clock}
                label="Study Time"
                value={userStats?.studySeconds / 60}
              />
              <StatCard
                icon={BookOpen}
                label="Flashcards"
                value={userStats?.createdFlashcards}
              />
              <StatCard
                icon={Brain}
                label="Studied Flashcards"
                value={userStats?.studiedFlashcards}
              />
              <StatCard
                icon={Users}
                label="Level"
                value={userStats?.expLevel}
              />
            </div>

            {/* Achievements */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                      <achievement.icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="font-medium text-white">
                      {achievement.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Overview */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-white">
                Activity Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Joined</p>
                      <p className="text-sm text-gray-400">{stats.joinDate}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                      <Medal className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Current Streak</p>
                      <p className="text-sm text-gray-400">
                        {stats.streak} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">{label}</span>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
