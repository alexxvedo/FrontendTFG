"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { UserPlus, Users, Activity, BarChart4, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { InviteUserDialog } from "@/components/workspace/invite-user-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceSocket } from "@/components/workspace/workspace-socket-provider";
import { useApi } from "@/lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ActivityList from "@/components/dashboard/ActivityList";
import Overview from "@/components/dashboard/Overview";
import Members from "@/components/dashboard/Members";
import Rankings from "@/components/dashboard/Rankings";

export default function Dashboard() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const [allUsers, setAllUsers] = useState([]);
  const api = useApi();
  const { connectedUsers, socket } = useWorkspaceSocket();

  const [activity, setActivity] = useState([]);
  const [usersWithStats, setUsersWithStats] = useState([]);

  const getUsers = async () => {
    if (!activeWorkspace) return;
    const response = await api.workspaces.getUsers(activeWorkspace.id);
    setAllUsers(response.data);

    // Obtener estadísticas para cada usuario
    const usersStats = await Promise.all(
      response.data.map(async (user) => {
        try {
          const stats = await api.userStats.getUserStats(user.email);
          return { ...user, stats };
        } catch (error) {
          console.error(`Error fetching stats for user ${user.email}:`, error);
          return { ...user, stats: null };
        }
      })
    );
    setUsersWithStats(usersStats);
  };

  const getActivity = async () => {
    if (!activeWorkspace) return;
    const response = await api.activity.getActivity(activeWorkspace.id);
    setActivity(response.data);
  };

  useEffect(() => {
    getUsers();
    getActivity();
    console.log("Connected users: ", connectedUsers);
  }, [activeWorkspace, socket]);

  useEffect(() => {
    if (socket && activeWorkspace?.id) {
      // Unirse a la página cuando el componente se monta
      socket.emit("join_page", activeWorkspace.id);

      // Limpieza: salir de la página cuando el componente se desmonta
      return () => {
        socket.emit("leave_page", activeWorkspace.id);
      };
    }
  }, [socket, activeWorkspace]);

  if (!connectedUsers || !socket || !activeWorkspace) return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground dark:bg-[#0A0A0F] dark:text-white">
      {/* Animated background gradient - sutilmente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-pink-900/5 to-blue-900/3 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-blue-900/5 pointer-events-none" />

      {/* Floating orbs background effect - sutilmente mejorado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/5 dark:bg-pink-600/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: isSidebarOpen ? "calc(100% - 256px)" : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="relative flex-1 max-w-[1600px] mx-auto p-5 md:p-8 pt-6"
      >
        {/* Header mejorado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              Dashboard
            </h2>
            <p className="text-muted-foreground dark:text-gray-400 mt-1">
              {activeWorkspace?.name} - Resumen de actividad
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Usuarios conectados */}
            <div className="flex items-center bg-background/80 dark:bg-gray-800/50 border border-border dark:border-gray-700/50 rounded-full px-3 py-1.5 shadow-sm">
              <div className="flex -space-x-2 mr-2">
                {connectedUsers &&
                  Array.from(connectedUsers.values())
                    .slice(0, 5)
                    .map((userData) => (
                      <div key={userData.email} className="relative">
                        <Avatar className="h-8 w-8 ring-2 ring-green-500/70 ring-offset-1 ring-offset-background dark:ring-offset-[#0A0A0F]">
                          <AvatarImage
                            src={userData.image}
                            alt={userData.name || "Usuario"}
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500">
                            {userData.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background dark:border-[#0A0A0F]" />
                      </div>
                    ))}
                {connectedUsers && connectedUsers.size > 5 && (
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted dark:bg-gray-700 text-xs font-medium">
                    +{connectedUsers.size - 5}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-foreground dark:text-gray-300">
                {connectedUsers.size} online
              </span>
            </div>

            {/* Botón de invitar */}
            <Button
              onClick={() => setIsInviteDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:opacity-90 transition-all"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invitar Amigos
            </Button>
          </div>
        </div>

        {/* Tabs mejorados */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="border-b border-border dark:border-gray-800 mb-2">
            <TabsList className="bg-transparent">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-foreground dark:data-[state=active]:text-white rounded-none px-4 py-2 text-muted-foreground dark:text-gray-400"
              >
                <BarChart4 className="h-4 w-4 mr-2" />
                Vista General
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-foreground dark:data-[state=active]:text-white rounded-none px-4 py-2 text-muted-foreground dark:text-gray-400"
              >
                <Users className="h-4 w-4 mr-2" />
                Miembros
              </TabsTrigger>
              <TabsTrigger
                value="rankings"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-foreground dark:data-[state=active]:text-white rounded-none px-4 py-2 text-muted-foreground dark:text-gray-400"
              >
                <Activity className="h-4 w-4 mr-2" />
                Rankings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Contenido de las tabs */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 gap-6">
              <div className="relative p-1 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-pink-500/3 to-gray-500/3 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/5 rounded-xl pointer-events-none" />
                <Card className="border border-border/40 dark:border-gray-800/40 bg-background/60 dark:bg-gray-900/40 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-medium">
                      Resumen
                    </CardTitle>
                    <CardDescription>
                      Vista general del workspace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Overview
                      connectedUsers={connectedUsers || []}
                      allUsers={allUsers}
                      activities={activity.length}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="relative p-1 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-pink-500/3 to-gray-500/3 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/5 rounded-xl pointer-events-none" />
                <Card className="border border-border/40 dark:border-gray-800/40 bg-background/60 dark:bg-gray-900/40 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-medium">
                      Actividad Reciente
                    </CardTitle>
                    <CardDescription>
                      Últimas acciones en el workspace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityList
                      className="w-full flex-1"
                      activityList={activity}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6 mt-4">
            <div className="relative p-1 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-pink-500/3 to-gray-500/3 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/5 rounded-xl pointer-events-none" />
              <Card className="border border-border/40 dark:border-gray-800/40 bg-background/60 dark:bg-gray-900/40 backdrop-blur-sm">
                <CardHeader className="pb-4 flex items-start space-x-3">
                  <div className="flex space-x-3 items-center">
                    <div className="p-2 bg-purple-100/80 dark:bg-purple-900/20 rounded-full">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                        Miembros del Workspace
                      </h2>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Gestiona los miembros y sus permisos en el workspace
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Members activeWorkspace={activeWorkspace} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rankings" className="space-y-6 mt-4">
            <div className="relative p-1 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-pink-900/5 to-blue-900/3 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-blue-900/5 rounded-xl pointer-events-none" />

              {/* Floating orbs background effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-64 h-64 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-600/5 dark:bg-pink-600/10 rounded-full blur-3xl animate-float-delayed" />
              </div>

              <Card className="border border-border/40 dark:border-gray-800/40 bg-background/60 dark:bg-gray-900/40 backdrop-blur-sm">
                <CardHeader className="pb-2 space-x-3">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>
                      <h2 className="text-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        Rankings y Clasificaciones
                      </h2>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-x-3">
                  <Rankings users={usersWithStats} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <InviteUserDialog
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          workspaceId={activeWorkspace?.id}
        />
      </motion.div>
    </div>
  );
}
