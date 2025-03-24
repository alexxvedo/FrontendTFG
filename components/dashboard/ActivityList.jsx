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

export default function ActivityList({ activityList }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log(activityList);

  return (
    <div className="w-full p-4">
      <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
        Actividad Reciente
      </h2>
      <div className="border border-gray-200/10 dark:border-gray-700/20 rounded-lg overflow-hidden bg-background/50 dark:bg-gray-800/20 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] font-semibold text-foreground dark:text-white ">
                <span className="flex items-center justify-center">
                  Usuario
                </span>
              </TableHead>
              <TableHead className="flex-1 font-semibold text-foreground dark:text-white">
                <span>Actividad</span>
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground dark:text-white w-[200px]">
                <span className="flex items-center justify-center">Fecha</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityList.map((activity) => (
              <TableRow
                key={activity.id}
                className="hover:bg-purple-500/3 dark:hover:bg-purple-500/5 transition-colors border-b border-gray-200/10 dark:border-gray-700/20 last:border-0"
              >
                <TableCell className="font-medium text-foreground dark:text-white flex items-center justify-center">
                  <TooltipProvider key={activity.user.email}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="border-[3px] w-10 h-10 cursor-pointer hover:scale-105 transition-transform ">
                          <AvatarImage src={activity.user.image} />
                          <AvatarFallback>
                            {activity.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-lg shadow-lg bg-background dark:text-white p-2">
                        <div className="flex flex-col gap-2 p-2">
                          <span className="font-semibold">
                            {activity.user.name}
                          </span>
                          <span className="text-sm opacity-90">
                            {activity.user.email}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-muted-foreground dark:text-gray-300">
                  {activity.action}
                </TableCell>
                <TableCell className="text-right text-muted-foreground dark:text-gray-400">
                  <span className="flex items-center justify-center">
                    {formatDate(activity.timestamp)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
