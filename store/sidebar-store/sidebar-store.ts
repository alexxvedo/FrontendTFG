import { create } from "zustand";
import { persist } from "zustand/middleware";

// Definir el tipo de un Workspace
interface Collection {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
  collections?: Collection[];
  unreadMessages?: number;
}

// Definir el estado global del Sidebar
interface SidebarState {
  isCollapsed: boolean;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  toggleCollapsed: () => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  clearWorkspaces: () => void;
  addWorkspace: (workspace: Workspace) => void;
  updateActiveWorkspace: (workspace: Workspace) => void;
  addCollectionToWorkspace: (
    workspaceId: string,
    collection: Collection
  ) => void;
  incrementUnreadMessages: (workspaceId: string) => void;
  clearUnreadMessages: (workspaceId: string) => void;
}

// Crear el store usando Zustand con persistencia
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      workspaces: [],
      activeWorkspace: null,

      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),

      setWorkspaces: (workspaces) => {
        const currentWorkspaces = get().workspaces;
        if (JSON.stringify(workspaces) !== JSON.stringify(currentWorkspaces)) {
          set({
            workspaces: workspaces.map((w) => ({
              ...w,
              unreadMessages:
                currentWorkspaces.find((cw) => cw.id === w.id)
                  ?.unreadMessages || 0,
            })),
          });
        }
      },

      clearWorkspaces: () => set({ workspaces: [], activeWorkspace: null }),

      addWorkspace: (workspace) => {
        const state = get();
        if (!state.workspaces.some((w) => w.id === workspace.id)) {
          set({
            workspaces: [
              ...state.workspaces,
              { ...workspace, unreadMessages: 0 },
            ],
            activeWorkspace: state.activeWorkspace || workspace,
          });
        }
      },

      updateActiveWorkspace: (workspace) => {
        const state = get();
        if (
          !state.activeWorkspace ||
          state.activeWorkspace.id !== workspace.id
        ) {
          // Al cambiar de workspace activo, limpiar sus mensajes no leídos
          set({
            activeWorkspace: workspace,
            workspaces: state.workspaces.map((w) =>
              w.id === workspace.id ? { ...w, unreadMessages: 0 } : w
            ),
          });
        }
      },

      incrementUnreadMessages: (workspaceId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId && state.activeWorkspace?.id !== workspaceId
              ? { ...w, unreadMessages: (w.unreadMessages || 0) + 1 }
              : w
          ),
        })),

      clearUnreadMessages: (workspaceId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, unreadMessages: 0 } : w
          ),
        })),

      addCollectionToWorkspace: (workspaceId, collection) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  collections: [...(w.collections || []), collection],
                }
              : w
          ),
          activeWorkspace:
            state.activeWorkspace?.id === workspaceId
              ? {
                  ...state.activeWorkspace,
                  collections: [
                    ...(state.activeWorkspace.collections || []),
                    collection,
                  ],
                }
              : state.activeWorkspace,
        })),
    }),
    {
      name: "sidebar-storage",
      version: 1,
      merge: (
        persistedState: unknown,
        currentState: SidebarState
      ): SidebarState => {
        const typedPersistedState = persistedState as Partial<SidebarState>;

        return {
          ...currentState,
          ...typedPersistedState,
          activeWorkspace:
            typedPersistedState?.activeWorkspace ||
            currentState.activeWorkspace,
        };
      },
    }
  )
);
