import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Overview({ connectedUsers, allUsers, activities }) {
  // Animaciones para los elementos
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <Card className="relative overflow-hidden border-gray-200/20 dark:border-gray-700/30 bg-background/60 dark:bg-gray-800/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative">
            <CardTitle className="text-base font-semibold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              Usuarios Conectados
            </CardTitle>
            <div className="p-2 bg-blue-100/80 dark:bg-blue-900/20 rounded-full">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          
          <CardContent className="relative pt-4">
            <div className="flex items-baseline">
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {connectedUsers?.length || 0}
              </div>
              <div className="ml-2 text-xs font-medium text-green-500 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-md">
                Online
              </div>
            </div>
            
            <div className="flex items-center mt-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <p className="text-sm text-muted-foreground">
                de {allUsers.length} miembros
              </p>
            </div>
            
            {allUsers.length > 0 && (
              <div className="mt-4 flex -space-x-2 overflow-hidden">
                {allUsers.slice(0, 5).map((user, index) => (
                  <div 
                    key={user.email || index} 
                    className="flex h-6 w-6 rounded-full ring-2 ring-background dark:ring-gray-900"
                    style={{ zIndex: 10 - index }}
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "Usuario"}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                ))}
                {allUsers.length > 5 && (
                  <div className="flex h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-background dark:ring-gray-900 items-center justify-center text-xs font-medium text-gray-800 dark:text-gray-200">
                    +{allUsers.length - 5}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <Card className="relative overflow-hidden border-gray-200/20 dark:border-gray-700/30 bg-background/60 dark:bg-gray-800/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-blue-500/10 rounded-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative">
            <CardTitle className="text-base font-semibold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              Colecciones Activas
            </CardTitle>
            <div className="p-2 bg-purple-100/80 dark:bg-purple-900/20 rounded-full">
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          
          <CardContent className="relative pt-4">
            <div className="flex items-baseline">
              <div className="text-3xl font-bold text-gray-800 dark:text-white">5</div>
              <div className="ml-2 text-xs font-medium text-blue-500 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md">
                Activas
              </div>
            </div>
            
            <div className="flex items-center mt-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              <p className="text-sm text-muted-foreground">
                +1 desde la última semana
              </p>
            </div>
            
            <div className="mt-4 grid grid-cols-5 gap-1">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full ${
                    i < 3 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              3 colecciones con actividad reciente
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <Card className="relative overflow-hidden border-gray-200/20 dark:border-gray-700/30 bg-background/60 dark:bg-gray-800/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-blue-500/5 to-purple-500/5 dark:from-pink-500/10 dark:via-blue-500/10 dark:to-purple-500/10 rounded-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/10 dark:bg-pink-400/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative">
            <CardTitle className="text-base font-semibold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              Actividad Reciente
            </CardTitle>
            <div className="p-2 bg-pink-100/80 dark:bg-pink-900/20 rounded-full">
              <Activity className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            </div>
          </CardHeader>
          
          <CardContent className="relative pt-4">
            <div className="flex items-baseline">
              <div className="text-3xl font-bold text-gray-800 dark:text-white">{activities}</div>
              <div className="ml-2 text-xs font-medium text-pink-500 dark:text-pink-400 bg-pink-100/50 dark:bg-pink-900/20 px-1.5 py-0.5 rounded-md">
                Total
              </div>
            </div>
            
            <div className="flex items-center mt-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mr-2" />
              <p className="text-sm text-muted-foreground">
                Acciones en las últimas 24h
              </p>
            </div>
            
            <div className="mt-4 relative h-8 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                style={{ width: `${Math.min(100, activities * 10)}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800 dark:text-white">
                {activities > 0 ? `${Math.min(100, activities * 10)}% de actividad` : 'Sin actividad reciente'}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
