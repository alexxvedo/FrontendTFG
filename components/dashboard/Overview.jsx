import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Overview({ connectedUsers, allUsers }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="relative overflow-hidden border-gray-200/10 dark:border-gray-700/20 bg-background/50 dark:bg-gray-800/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-gray-500/2 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/3 rounded-xl pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
            Usuarios Conectados
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">{connectedUsers?.size}</div>
          <div className="flex items-center mt-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <p className="text-sm text-muted-foreground">
              de {allUsers.length} miembros
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden border-gray-200/10 dark:border-gray-700/20 bg-background/50 dark:bg-gray-800/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-gray-500/2 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/3 rounded-xl pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
            Colecciones Activas
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">
            +1 desde la última semana
          </p>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden border-gray-200/10 dark:border-gray-700/20 bg-background/50 dark:bg-gray-800/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-pink-500/3 to-gray-500/2 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/3 rounded-xl pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">
            Acciones en las últimas 24h
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
