"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  BookA,
  MessageCircleIcon,
  ChartPie,
  ListTodo,
  Settings,
  ChevronLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useUserStore } from "@/store/user-store/user-store";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

export function AppSidebar({ ...props }) {
  const { data: session } = useSession();
  const user = session?.user;
  const setUser = useUserStore((state) => state.setUser);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);
  const setWorkspaces = useSidebarStore((state) => state.setWorkspaces);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);
  const api = useApi();

  useEffect(() => {
    if (user) {
      setUser(user);
      setIsLoading(false);
    }
  }, [user, setUser]);

  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!user?.email) return;

      try {
        const response = await api.workspaces.listByUser(user.email);
        setWorkspaces(response.data);
      } catch (error) {
        console.error("Error loading workspaces:", error);
        toast.error("Error loading workspaces");
      }
    };

    if (user) {
      loadWorkspaces();
    }
  }, [user, api, setWorkspaces]);

  const navItems = useMemo(
    () => [
      {
        title: "Resumen",
        url: `/workspaces/${activeWorkspace?.id}`,
        icon: Home,
        isActive: true,
      },
      {
        title: "Colecciones",
        url: `/workspaces/${activeWorkspace?.id}/collections`,
        icon: BookA,
        isActive: false,
      },
      {
        title: "Chat",
        url: `/workspaces/${activeWorkspace?.id}/chat`,
        icon: MessageCircleIcon,
        isActive: false,
      },
      {
        title: "Tareas",
        url: `/workspaces/${activeWorkspace?.id}/agenda`,
        icon: ListTodo,
        isActive: false,
      },
    ],
    [activeWorkspace]
  );

  if (!user) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-700/20 via-pink-900/20 to-blue-900/15 dark:from-purple-900/15 dark:via-pink-500/10 dark:to-blue-500/5 pointer-events-none rounded-lg" />

      <SidebarHeader className="relative">
        <motion.div
          initial={hasAnimated ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2"
        >
          {isLoading ? (
            <Skeleton className="w-full h-10 p-4 rounded-md" />
          ) : (
            <WorkspaceSwitcher />
          )}
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="relative">
        <motion.div
          initial={hasAnimated ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2"
        >
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-full h-8 p-4 rounded-md" />
              ))}
            </div>
          ) : (
            <NavMain items={navItems} isCollapsed={isCollapsed} />
          )}
        </motion.div>
      </SidebarContent>

      <SidebarFooter className="relative">
        <div className="mt-auto border-t border-gray-200/10 dark:border-gray-700/20 pt-4">
          {isLoading ? (
            <Skeleton className="w-full h-12 p-4 rounded-md" />
          ) : (
            <NavUser user={user} />
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
