import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Activity, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/date-utils";

export default function ActivityList({ activityList }) {
  // Animaciones para los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="w-full p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-pink-100/80 dark:bg-pink-900/20 rounded-full">
            <Activity className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
            Actividad Reciente
          </h2>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          <span>Últimas actualizaciones</span>
        </div>
      </div>

      <div className="relative overflow-hidden border border-gray-200/20 dark:border-gray-700/30 rounded-xl bg-background/60 dark:bg-gray-800/30 backdrop-blur-sm shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-blue-500/3 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-blue-500/5 rounded-xl pointer-events-none" />

        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
            <TableRow className="border-b border-gray-200/20 dark:border-gray-700/30 hover:bg-transparent">
              <TableHead className="w-[100px] font-semibold text-foreground/90 dark:text-white/90 py-4">
                <span className="flex items-center justify-center">
                  Usuario
                </span>
              </TableHead>
              <TableHead className="flex-1 font-semibold text-foreground/90 dark:text-white/90 py-4">
                <span>Actividad</span>
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground/90 dark:text-white/90 w-[200px] py-4">
                <span className="flex items-center justify-center">Fecha</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityList.map((activity, index) => (
              <motion.tr
                key={activity.id || index}
                variants={itemVariants}
                className="group border-b border-gray-200/10 dark:border-gray-700/20 last:border-0"
              >
                <TableCell className="font-medium text-foreground dark:text-white py-4">
                  <div className="flex items-center justify-center">
                    <TooltipProvider key={activity.user.email}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="border-2 border-background dark:border-gray-900 w-10 h-10 cursor-pointer hover:scale-105 transition-transform shadow-sm group-hover:shadow-md">
                            <AvatarImage src={activity.user.image} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {activity.user.name?.charAt(0).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-lg shadow-lg bg-background/95 dark:bg-gray-800/95 dark:text-white p-3 border border-gray-200/20 dark:border-gray-700/30 backdrop-blur-sm">
                          <div className="flex flex-col gap-2">
                            <span className="font-semibold text-foreground dark:text-white">
                              {activity.user.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {activity.user.email}
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground dark:text-gray-300 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                    <span className="group-hover:text-foreground dark:group-hover:text-white transition-colors">
                      {activity.action}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground dark:text-gray-400 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="px-2 py-1 rounded-md bg-gray-100/50 dark:bg-gray-800/50 text-xs font-medium group-hover:bg-gray-200/50 dark:group-hover:bg-gray-700/50 transition-colors">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
            {activityList.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground py-8">
                    <div className="rounded-full bg-gray-100/80 dark:bg-gray-800/80 p-3">
                      <Activity className="h-6 w-6 text-gray-400" />
                    </div>
                    <p>No hay actividad reciente</p>
                    <p className="text-sm">
                      Las acciones realizadas en el workspace aparecerán aquí
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
