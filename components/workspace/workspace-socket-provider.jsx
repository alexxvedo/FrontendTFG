"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

const WorkspaceSocketContext = createContext({});

export function WorkspaceSocketProvider({ children }) {
  const { data: session } = useSession();
  const { activeWorkspace: workspace } = useSidebarStore();
  const [usersInCollection, setUsersInCollection] = useState({});
  const [connectedUsers, setConnectedUsers] = useState(new Map());
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off("connect");
      socketRef.current.off("connect_error");
      socketRef.current.off("users_connected");
      socketRef.current.off("user_joined");
      socketRef.current.off("user_disconnected");
      socketRef.current.off("collection_users_updated");
      socketRef.current.off("user_entered_collection");
      socketRef.current.off("user_left_collection");

      if (workspace?.id) {
        socketRef.current.emit("leave_workspace", workspace.id);
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [workspace?.id]);

  useEffect(() => {
    if (!session?.user || !workspace?.id) {
      cleanupSocket();
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      cleanupSocket();
    }

    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;

    const handleConnect = () => {
      newSocket.emit("join_workspace", workspace.id, {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      });

      newSocket.emit("get_collections_users", workspace.id);
    };

    newSocket.on("connect", handleConnect);

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          cleanupSocket();
          reconnectTimeoutRef.current = null;
        }, 5000);
      }
    });

    newSocket.on("users_connected", (users) => {
      const usersMap = new Map();
      users.forEach((user) => {
        usersMap.set(user.email, user);
      });
      setConnectedUsers(usersMap);
    });

    newSocket.on("user_joined", (userData) => {
      setConnectedUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(userData.email, userData);
        return newMap;
      });
    });

    newSocket.on("user_disconnected", (email) => {
      setConnectedUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(email);
        return newMap;
      });
    });

    newSocket.on("collection_users_updated", ({ collectionId, users }) => {
      setUsersInCollection((prev) => {
        const newState = {
          ...prev,
          [collectionId]: users,
        };
        return newState;
      });
    });

    newSocket.on("user_entered_collection", ({ collectionId, user }) => {
      if (user) {
        setUsersInCollection((prev) => {
          const currentUsers = prev[collectionId] || [];
          if (!currentUsers.some((u) => u.email === user.email)) {
            return {
              ...prev,
              [collectionId]: [...currentUsers, user],
            };
          }
          return prev;
        });
      }
    });

    newSocket.on("user_left_collection", ({ collectionId, user }) => {
      if (user) {
        setUsersInCollection((prev) => {
          const currentUsers = prev[collectionId] || [];
          const updatedUsers = currentUsers.filter(
            (u) => u.email !== user.email
          );
          return {
            ...prev,
            [collectionId]: updatedUsers,
          };
        });
      }
    });

    return () => {
      cleanupSocket();
    };
  }, [session?.user, workspace?.id, cleanupSocket]);

  const joinCollection = useCallback(
    (collectionId) => {
      if (socketRef.current && collectionId && workspace?.id && session?.user) {
        socketRef.current.emit("join_collection", workspace.id, collectionId, {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        });
      }
    },
    [workspace?.id, session?.user]
  );

  const leaveCollection = useCallback(
    (collectionId) => {
      if (socketRef.current && collectionId && workspace?.id) {
        socketRef.current.emit("leave_collection", workspace.id, collectionId);
      }
    },
    [workspace?.id]
  );

  const value = {
    socket: socketRef.current,
    user: session?.user,
    usersInCollection,
    connectedUsers,
    joinCollection,
    leaveCollection,
  };

  return (
    <WorkspaceSocketContext.Provider value={value}>
      {children}
    </WorkspaceSocketContext.Provider>
  );
}

export function useWorkspaceSocket() {
  const context = useContext(WorkspaceSocketContext);
  if (!context) {
    throw new Error(
      "useWorkspaceSocket must be used within a WorkspaceSocketProvider"
    );
  }
  return context;
}
