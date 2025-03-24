"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { PanelLeftOpen, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { InviteUserDialog } from "@/components/workspace/invite-user-dialog";
import { WorkspaceUsersList } from "@/components/workspace/workspace-users-list";
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

export default function Dashboard({ params }) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const [allUsers, setAllUsers] = useState([]);
  const api = useApi();
  const { connectedUsers, socket, user: socketUser } = useWorkspaceSocket();

  const [activity, setActivity] = useState([]);

  const getUsers = async () => {
    if (!activeWorkspace) return;
    const response = await api.workspaces.getUsers(activeWorkspace.id);
    setAllUsers(response.data);
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
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-pink-900/5 to-blue-900/3 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-blue-900/5  pointer-events-none" />

      {/* Floating orbs background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-600/5 dark:bg-pink-600/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: isSidebarOpen ? "calc(100% - 256px)" : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="relative flex-1 space-y-6 p-4 md:p-8 pt-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              Dashboard
            </h2>
            <div className="flex items-center space-x-2 ml-4">
              {connectedUsers &&
                Array.from(connectedUsers.values()).map((userData) => (
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
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsInviteDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:opacity-90 transition-all"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invitar Amigos
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 dark:bg-gray-800/50 border border-border dark:border-gray-700/50">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/10 data-[state=active]:to-pink-500/10 data-[state=active]:text-foreground dark:data-[state=active]:from-purple-500/20 dark:data-[state=active]:to-pink-500/20 dark:data-[state=active]:text-white text-muted-foreground dark:text-gray-400"
            >
              Vista General
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/10 data-[state=active]:to-pink-500/10 data-[state=active]:text-foreground dark:data-[state=active]:from-purple-500/20 dark:data-[state=active]:to-pink-500/20 dark:data-[state=active]:text-white text-muted-foreground dark:text-gray-400"
            >
              Miembros
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="relative p-1 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-pink-500/3 to-gray-500/3 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/5 rounded-xl" />
              <Overview
                connectedUsers={connectedUsers || []}
                allUsers={allUsers}
                activities={activity.length}
              />
            </div>
            <div className="relative p-1 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-pink-500/3 to-gray-500/3 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/5 rounded-xl" />
              <ActivityList className="w-full flex-1" activityList={activity} />
            </div>
          </TabsContent>
          <TabsContent value="members" className="space-y-6">
            <div className="relative p-1 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-pink-500/3 to-gray-500/3 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-gray-500/5 rounded-xl" />
              <Members activeWorkspace={activeWorkspace} />
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
