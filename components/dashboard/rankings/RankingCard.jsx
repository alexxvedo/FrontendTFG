"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, ArrowUpRight } from "lucide-react";
import { getPositionBadge } from "./utils";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

export default function RankingCard({
  title,
  icon: Icon,
  color,
  gradient,
  users,
  getValue,
  format,
  chartData,
}) {
  const sortedUsers = [...users].sort((a, b) => getValue(b) - getValue(a));

  const getGradientColors = () => {
    const colorMap = {
      "from-yellow-500 to-amber-500": ["#EAB308", "#F59E0B"],
      "from-blue-500 to-cyan-500": ["#3B82F6", "#06B6D4"],
      "from-orange-500 to-red-500": ["#F97316", "#EF4444"],
      "from-green-500 to-emerald-500": ["#22C55E", "#10B981"],
      "from-purple-500 to-pink-500": ["#A855F7", "#EC4899"],
    };
    return colorMap[gradient] || ["#A855F7", "#EC4899"];
  };

  // Animaciones más suaves para los elementos
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 5 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const renderChart = () => {
    if (!chartData) return null;

    const data = chartData(sortedUsers);
    const gradientColors = getGradientColors();

    return (
      <div className="h-48 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient
                id={`gradient-${title}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={gradientColors[0]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="100%"
                  stopColor={gradientColors[1]}
                  stopOpacity={0.8}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#374151"
              opacity={0.2}
            />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#374151" }}
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#374151" }}
              tick={{ fill: "#9CA3AF" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#F3F4F6",
                padding: "8px 12px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
              cursor={{ fill: "rgba(107, 114, 128, 0.1)" }}
              labelStyle={{ color: "#9CA3AF", marginBottom: "4px" }}
            />
            <Bar
              dataKey="value"
              fill={`url(#gradient-${title})`}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${title})`}
                  style={{
                    filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))",
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderPositionBadge = (index) => {
    const badge = getPositionBadge(index);
    return (
      <div className="flex items-center gap-1">
        {badge.icon &&
          (badge.icon === "Trophy" ? (
            <Trophy className={`h-5 w-5 ${badge.color}`} />
          ) : badge.icon === "Crown" ? (
            <Crown className={`h-5 w-5 ${badge.color}`} />
          ) : (
            <Medal className={`h-5 w-5 ${badge.color}`} />
          ))}
        <span className={`${badge.color} font-bold`}>{badge.text}</span>
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden border-gray-200/20 dark:border-gray-700/30 bg-background/60 dark:bg-gray-800/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/5 via-purple-500/5 to-gray-50/5 dark:from-gray-900/10 dark:via-purple-500/5 dark:to-gray-900/10 rounded-xl opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <div className="p-5 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-gradient-to-r ${gradient} bg-opacity-10`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white">{title}</h3>
          </div>
          <button className="text-xs text-muted-foreground dark:text-gray-400 flex items-center hover:text-foreground dark:hover:text-white transition-colors">
            <span>Ver todo</span>
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </button>
        </div>
        
        <motion.div 
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {sortedUsers.slice(0, 5).map((user, index) => (
            <motion.div
              key={user.email}
              variants={item}
              className="flex items-center gap-4 p-3 rounded-lg bg-background/40 dark:bg-gray-800/40 border border-gray-200/20 dark:border-gray-700/30 hover:bg-background/60 dark:hover:bg-gray-800/60 transition-all group"
            >
              <div className="w-12 text-center">
                {renderPositionBadge(index)}
              </div>
              <Avatar className="h-10 w-10 ring-2 ring-background/80 dark:ring-gray-900/80 border border-gray-200/20 dark:border-gray-700/30 shadow-sm group-hover:shadow-md transition-all">
                <AvatarImage
                  src={user.image}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  {user.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 hidden sm:block">
                  <Progress
                    value={(getValue(user) / getValue(sortedUsers[0])) * 100}
                    className="h-2 bg-gray-200/50 dark:bg-gray-700/50"
                    indicatorClassName={`bg-gradient-to-r ${gradient}`}
                  />
                </div>
                <span className="w-24 text-right font-medium text-foreground dark:text-white">
                  {format(getValue(user))}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {renderChart()}
      </div>
    </Card>
  );
}
