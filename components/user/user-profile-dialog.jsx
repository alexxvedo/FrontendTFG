"use client";

import { useState } from "react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">Profile</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[80vh]">
          {/* Hero Section */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500" />
            <Avatar className="absolute -bottom-12 left-6 h-24 w-24 border-4 border-background">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="px-6 pt-14 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Pro Member
              </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <StatCard icon={Clock} label="Study Time" value={stats.studyTime} />
              <StatCard
                icon={BookOpen}
                label="Flashcards"
                value={stats.flashcardsCreated}
              />
              <StatCard
                icon={Brain}
                label="Study Sessions"
                value={stats.studySessions}
              />
              <StatCard
                icon={Users}
                label="Collaborators"
                value={stats.collaborators}
              />
            </div>

            {/* Achievements */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <achievement.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{achievement.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Overview */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Activity Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Joined</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.joinDate}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Medal className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Current Streak</p>
                      <p className="text-sm text-muted-foreground">
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
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
