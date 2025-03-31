"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";
import { getPositionBadge } from "./utils";
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
          ) : (
            <Medal className={`h-5 w-5 ${badge.color}`} />
          ))}
        <span className={`${badge.color} font-bold`}>{badge.text}</span>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800/30 border-gray-700">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`h-5 w-5 ${color}`} />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-3">
          {sortedUsers.slice(0, 5).map((user, index) => (
            <div
              key={user.email}
              className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 transition-colors group"
            >
              <div className="w-12 text-center">
                {renderPositionBadge(index)}
              </div>
              <Avatar className="h-8 w-8 border-2 border-gray-700">
                <AvatarImage
                  src={user.image}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32">
                  <Progress
                    value={(getValue(user) / getValue(sortedUsers[0])) * 100}
                    className="h-2 bg-gray-700/50"
                    indicatorClassName={`bg-gradient-to-r ${gradient}`}
                  />
                </div>
                <span className="w-24 text-right font-medium text-white">
                  {format(getValue(user))}
                </span>
              </div>
            </div>
          ))}
        </div>
        {renderChart()}
      </div>
    </Card>
  );
}
