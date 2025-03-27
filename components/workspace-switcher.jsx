"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, SquareTerminal } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

import dynamic from "next/dynamic";

const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export function WorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const [workspaceName, setWorkspaceName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const api = useApi();

  const workspaces = useSidebarStore((state) => state.workspaces || []);
  const setWorkspaces = useSidebarStore((state) => state.setWorkspaces);
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Cargar workspaces al inicio
  useEffect(() => {
    let mounted = true;

    const loadWorkspaces = async () => {
      if (!user?.id) return;

      try {
        const response = await api.workspaces.listByUser(user.email);

        // Solo actualizar si el componente sigue montado
        if (!mounted) return;

        // Asegurarnos de que workspacesList es un array
        const safeWorkspacesList = Array.isArray(response.data)
          ? response.data
          : [];

        // Solo actualizar workspaces si han cambiado
        if (
          mounted &&
          JSON.stringify(safeWorkspacesList) !== JSON.stringify(workspaces)
        ) {
          setWorkspaces(safeWorkspacesList);

          // Si no hay workspace activo o el workspace activo ya no existe en la lista
          if (
            safeWorkspacesList.length > 0 &&
            (!activeWorkspace ||
              !safeWorkspacesList.some((w) => w.id === activeWorkspace.id))
          ) {
            updateActiveWorkspace(safeWorkspacesList[0]);
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.error("Error loading workspaces:", error);
        toast.error("Error loading workspaces");
      }
    };

    loadWorkspaces();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [user?.id]); // Solo depender del ID del usuario

  const handleWorkspaceChange = useCallback(
    async (workspace) => {
      try {
        // Primero actualizamos el estado para evitar que el router revierta el cambio
        updateActiveWorkspace(workspace);

        // Usamos push en lugar de replace para forzar una nueva entrada en el historial
        await router.push(`/workspaces/${workspace.id}/`);
      } catch (error) {
        console.error("Error changing workspace:", error);
        toast.error("Error changing workspace");
      }
    },
    [updateActiveWorkspace, router]
  );

  const handleCreateWorkspace = useCallback(
    async (e) => {
      e.preventDefault();
      if (!workspaceName.trim() || !user) return;

      try {
        const newWorkspace = await api.workspaces.create(user.email, {
          name: workspaceName,
          user: user.email,
        });

        // Asegurarnos de que workspaces es un array antes de actualizarlo
        const currentWorkspaces = Array.isArray(workspaces) ? workspaces : [];
        const updatedWorkspaces = [...currentWorkspaces, newWorkspace.data];

        setWorkspaces(updatedWorkspaces);
        updateActiveWorkspace(newWorkspace.data);
        setWorkspaceName("");
        setIsDialogOpen(false);

        // Redirigir a la página de colecciones del nuevo workspace
        router.push(`/workspaces/${newWorkspace.data.id}/`);
        toast.success("Workspace created successfully");
      } catch (error) {
        console.error("Error creating workspace:", error);
        toast.error("Error creating workspace");
      }
    },
    [
      workspaceName,
      user?.id,
      router,
      updateActiveWorkspace,
      setWorkspaces,
      workspaces,
    ]
  );

  // Si no hay usuario autenticado, mostrar un estado de carga
  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <SquareTerminal className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                aria-label="Select a workspace"
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg ">
                  <SquareTerminal className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeWorkspace?.name || "Select a workspace"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Array.isArray(workspaces) ? workspaces : []).map(
                (workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => handleWorkspaceChange(workspace)}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800/70 focus:bg-zinc-100 dark:focus:bg-zinc-800/70"
                  >
                    {workspace.name}
                    {workspace.id === activeWorkspace?.id && (
                      <DropdownMenuShortcut>✓</DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem className="hover:bg-zinc-100 dark:hover:bg-zinc-800/70 focus:bg-zinc-100 dark:focus:bg-zinc-800/70">
                  <Plus className="mr-2 h-4 w-4 text-blue-500 dark:text-purple-400" />{" "}
                  Create Workspace
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900/95 border border-purple-500/20 backdrop-blur-sm shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Workspace
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new workspace to organize your collections.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateWorkspace}>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder="Workspace name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="pr-10 bg-zinc-800 border-zinc-700 text-white focus:ring-purple-500/30 focus:border-purple-500/50"
                />
                {/* Botón para mostrar/ocultar el picker */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xl"
                  aria-label="Emoji picker"
                >
                  😊
                </button>

                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div className="absolute z-50 mt-1">
                    <Picker
                      onEmojiClick={(
                        emojiData /* primer argumento */,
                        event /* opcional */
                      ) => {
                        setWorkspaceName((prev) => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      disableAutoFocus={true}
                      native
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none shadow-md hover:shadow-lg transition-all duration-200"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
