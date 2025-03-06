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

export default function Dashboard({ params }) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const [allUsers, setAllUsers] = useState([]);
  const api = useApi();
  const { connectedUsers, socket, user: socketUser } = useWorkspaceSocket();

  const getUsers = async () => {
    if (!activeWorkspace) return;
    const response = await api.workspaces.getUsers(activeWorkspace.id);
    setAllUsers(response.data);
  };

  useEffect(() => {
    getUsers();
  }, [activeWorkspace]);

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

  return (
    <motion.div
      initial={{ width: "100%" }}
      animate={{ width: isSidebarOpen ? "calc(100% - 256px)" : "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="flex-1 space-y-4 p-4 md:p-8 pt-6"
    >
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2 ml-4">
            {connectedUsers &&
              Array.from(connectedUsers.values()).map((userData) => (
                <div key={userData.email} className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-green-500 ring-offset-2">
                    <AvatarImage 
                      src={userData.image} 
                      alt={userData.name || "Usuario"}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback>
                      {userData.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
                </div>
              ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invitar Amigos
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuarios Conectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedUsers?.size}</div>
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  <p className="text-sm text-muted-foreground">
                    de {allUsers.length} miembros
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Colecciones Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  +1 desde la última semana
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Acciones en las últimas 24h
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Workspace</CardTitle>
              <CardDescription>
                Gestiona los miembros y sus permisos en el workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspaceUsersList workspaceId={activeWorkspace?.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        workspaceId={activeWorkspace?.id}
      />
    </motion.div>
  );
}
