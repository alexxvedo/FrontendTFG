"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Brain,
  Clock,
  Star,
  Users,
  ChevronRight,
  Target,
  Trophy,
} from "lucide-react";

export function CollectionsSection({ userStats }) {
  if (!userStats) return null;
  
  // Sample collections data - in a real app, this would come from the API
  const collections = [
    {
      name: "Mathematics",
      description: "Advanced calculus and algebra",
      totalCards: 150,
      masteredCards: 89,
      lastStudied: "2h ago",
      contributors: 3,
      tags: ["Math", "Advanced"],
      streak: 7,
      color: "from-blue-400 to-cyan-400",
    },
    {
      name: "Computer Science",
      description: "Data structures and algorithms",
      totalCards: 200,
      masteredCards: 120,
      lastStudied: "1d ago",
      contributors: 5,
      tags: ["CS", "Programming"],
      streak: 4,
      color: "from-purple-400 to-pink-400",
    },
    {
      name: "Physics",
      description: "Quantum mechanics fundamentals",
      totalCards: 100,
      masteredCards: 45,
      lastStudied: "3d ago",
      contributors: 2,
      tags: ["Physics", "Advanced"],
      streak: 2,
      color: "from-green-400 to-emerald-400",
    },
  ];

  // Get collection stats from userStats if available, otherwise use sample data
  const totalCollections = userStats?.totalCollections || collections.length;
  const activeCollections = userStats?.activeCollections || Math.ceil(collections.length * 0.7);
  const totalCards = collections.reduce((acc, col) => acc + col.totalCards, 0);
  const masteredCards = collections.reduce((acc, col) => acc + col.masteredCards, 0);
  const activeStreak = Math.max(...collections.map((col) => col.streak));
  
  const studyStats = {
    totalCollections,
    activeCollections,
    totalCards,
    masteredCards,
    activeStreak
  };

  return (
    <div className="space-y-8">
      {/* Collections Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">Collections</span>
          </div>
          <p className="text-2xl font-bold text-white">{studyStats.totalCollections}</p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Total Cards</span>
          </div>
          <p className="text-2xl font-bold text-white">{studyStats.totalCards}</p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Mastered</span>
          </div>
          <p className="text-2xl font-bold text-white">{studyStats.masteredCards}</p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Best Streak</span>
          </div>
          <p className="text-2xl font-bold text-white">{studyStats.activeStreak} days</p>
        </div>
      </div>

      {/* Collections List */}
      <div className="space-y-4">
        {collections.map((collection, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/50 backdrop-blur-sm hover:bg-zinc-800/70 transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      {collection.name}
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                    </h3>
                    <p className="text-sm text-gray-400">{collection.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {collection.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        className={`bg-gradient-to-r ${collection.color} border-none`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Progress and Stats */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Mastery Progress</span>
                      <span>
                        {collection.masteredCards} / {collection.totalCards} cards
                      </span>
                    </div>
                    <Progress
                      value={(collection.masteredCards / collection.totalCards) * 100}
                      className="h-1.5 bg-zinc-800"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{collection.lastStudied}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{collection.contributors} contributors</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{collection.streak} day streak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
