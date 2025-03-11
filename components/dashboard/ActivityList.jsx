import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const actividad = [
  {
    id: 1,
    userId: 1,
    activity: "Creo una nueva colección: Mi Colección",
    timestamp: "2023-08-01T12:34:56Z",
  },
  {
    id: 2,
    userId: 1,
    activity: "Creo una flashcard en la colección Mi Colección",
    timestamp: "2023-08-02T09:45:12Z",
  },
  {
    id: 3,
    userId: 2,
    activity: "Entró a la colección Mi Colección",
    timestamp: "2023-08-03T15:20:45Z",
  },
  {
    id: 4,
    userId: 1,
    activity: "Eliminó una flashcard de la colección Mi Colección",
    timestamp: "2023-08-04T18:10:30Z",
  },
];

export default function ActivityList() {
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

  return (
    <div className="w-full p-4">
      <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">Actividad Reciente</h2>
      <div className="border border-gray-200/10 dark:border-gray-700/20 rounded-lg overflow-hidden bg-background/50 dark:bg-gray-800/20 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-purple-500/3 dark:bg-purple-500/5 border-b border-gray-200/10 dark:border-gray-700/20">
              <TableHead className="w-[100px] font-semibold text-foreground dark:text-white">Usuario</TableHead>
              <TableHead className="w-[500px] font-semibold text-foreground dark:text-white">Actividad</TableHead>
              <TableHead className="text-right font-semibold text-foreground dark:text-white">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actividad.map((activity) => (
              <TableRow 
                key={activity.id}
                className="hover:bg-purple-500/3 dark:hover:bg-purple-500/5 transition-colors border-b border-gray-200/10 dark:border-gray-700/20 last:border-0"
              >
                <TableCell className="font-medium text-foreground dark:text-white">
                  Usuario {activity.userId}
                </TableCell>
                <TableCell className="text-muted-foreground dark:text-gray-300">{activity.activity}</TableCell>
                <TableCell className="text-right text-muted-foreground dark:text-gray-400">
                  {formatDate(activity.timestamp)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
