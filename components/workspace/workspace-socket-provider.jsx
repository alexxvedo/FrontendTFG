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
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { useSocket } from "@/context/socket";
import { toast } from "sonner";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

const WorkspaceSocketContext = createContext({});

export function WorkspaceSocketProvider({ children }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { activeWorkspace: workspace } = useSidebarStore();
  const { setWorkspaces, updateActiveWorkspace } = useSidebarStore();
  const {
    socket: baseSocket,
    isConnected: baseSocketConnected,
    createAuthToken,
  } = useSocket();

  const [usersInCollection, setUsersInCollection] = useState({});
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [agendaUsers, setAgendaUsers] = useState([]);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const lastWorkspaceIdRef = useRef(null);
  const isReconnectingRef = useRef(false);
  const lastVisibilityChangeRef = useRef(Date.now());

  // Detectar cambios de visibilidad de la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      lastVisibilityChangeRef.current = Date.now();
      if (document.hidden) {
        console.log("Pestaña oculta");
      } else {
        console.log("Pestaña visible de nuevo");
        // Marcar que la próxima reconexión es debido a cambio de visibilidad
        isReconnectingRef.current = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Limpiar socket al desmontar o cambiar de workspace
  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      console.log("Limpiando socket del workspace");

      // Desregistrar todos los eventos
      socketRef.current.off("connect");
      socketRef.current.off("connect_error");
      socketRef.current.off("users_connected");
      socketRef.current.off("user_joined");
      socketRef.current.off("user_left");
      socketRef.current.off("collection_users_updated");
      socketRef.current.off("collection_user_joined");
      socketRef.current.off("collection_user_left");
      socketRef.current.off("new_message");
      socketRef.current.off("message_history");
      socketRef.current.off("user_typing");
      socketRef.current.off("user_stop_typing");
      socketRef.current.off("workspace_deleted");
      socketRef.current.off("collection_deleted");
      socketRef.current.off("error");

      // Salir del workspace si estábamos conectados
      if (lastWorkspaceIdRef.current) {
        socketRef.current.emit("leave_workspace", lastWorkspaceIdRef.current);
      }

      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Efecto para conectar/desconectar el socket cuando cambia el workspace
  useEffect(() => {
    // No hacer nada si no hay socket base, usuario o workspace
    if (!baseSocket || !session?.user || !workspace?.id) {
      cleanupSocket();
      return;
    }

    // Limpiar timeout de reconexión si existe
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // No desconectar el socket si ya está conectado al mismo workspace
    if (socketRef.current && isConnected) {
      const currentWorkspace = lastWorkspaceIdRef.current;
      if (currentWorkspace === workspace.id) {
        console.log("Socket ya conectado al workspace:", workspace.id);
        // Solicitar la lista actualizada de usuarios y mensajes
        socketRef.current.emit("get_workspace_users", workspace.id);
        return;
      }
      // Si está conectado a otro workspace, limpiarlo
      cleanupSocket();
    }

    console.log("Conectando al workspace:", workspace.id);

    // Crear nuevo socket para el workspace
    const token = createAuthToken(session.user);
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ["websocket", "polling"],
      auth: { token },
      query: {
        workspaceId: workspace.id,
      },
    });

    // Guardar referencia al socket y al workspace
    socketRef.current = newSocket;
    lastWorkspaceIdRef.current = workspace.id;

    // Manejar eventos de conexión
    newSocket.on("connect", () => {
      console.log("Socket conectado al servidor de workspace");
      setIsConnected(true);

      // Verificar si es una reconexión reciente (dentro de los últimos 30 segundos)
      const timeSinceVisibilityChange =
        Date.now() - lastVisibilityChangeRef.current;
      const isRecentReconnection =
        isReconnectingRef.current && timeSinceVisibilityChange < 30000;

      // Unirse al workspace con información sobre si es reconexión
      newSocket.emit("join_workspace", workspace.id, {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image || null,
        isReconnection: isRecentReconnection,
      });

      // Reset del flag de reconexión
      if (isReconnectingRef.current) {
        isReconnectingRef.current = false;
      }

      // Solicitar usuarios de colecciones
      newSocket.emit("get_collections_users", workspace.id);
    });

    // Recibir lista de usuarios conectados
    newSocket.on("users_connected", (users) => {
      console.log("Usuarios conectados recibidos:", users.length);

      // Filtrar usuarios duplicados por email
      const uniqueUsers = Array.from(
        new Map(users.map((user) => [user.email, user])).values()
      );

      setConnectedUsers(uniqueUsers);
    });

    // Manejar cuando un usuario se une al workspace
    newSocket.on("user_joined", (userData) => {
      console.log(
        "Usuario unido:",
        userData.name,
        "isReconnection:",
        userData.isReconnection
      );
      setConnectedUsers((prev) => {
        // Verificar si el usuario ya está en la lista
        const exists = prev.some((user) => user.email === userData.email);
        if (exists) {
          // Si existe, actualizar sus datos en lugar de añadirlo de nuevo
          return prev.map((user) =>
            user.email === userData.email ? userData : user
          );
        }
        return [...prev, userData];
      });

      // Mostrar notificación solo si no es el usuario actual y no es una reconexión
      if (userData.email !== session.user.email && !userData.isReconnection) {
        toast.info(`${userData.name} se ha unido al workspace`);
      }
    });

    // Manejar cuando un usuario abandona el workspace
    newSocket.on("user_left", (userData) => {
      console.log("Usuario desconectado:", userData.name);
      setConnectedUsers((prev) =>
        prev.filter((user) => user.email !== userData.email)
      );

      // Mostrar notificación
      if (userData.email !== session.user.email) {
        toast.info(`${userData.name} ha abandonado el workspace`);
      }
    });

    // Manejar errores de conexión
    newSocket.on("connect_error", (error) => {
      console.error("Error de conexión al workspace:", error);
      setIsConnected(false);

      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          cleanupSocket();
          reconnectTimeoutRef.current = null;
        }, 5000);
      }
    });

    // Manejar actualizaciones de usuarios en colecciones
    newSocket.on("collection_users_updated", ({ collectionId, users }) => {
      console.log(
        `Usuarios actualizados en colección ${collectionId}:`,
        users.length
      );

      // Filtrar usuarios duplicados por email
      const uniqueUsers = Array.from(
        new Map(users.map((user) => [user.email, user])).values()
      );

      setUsersInCollection((prev) => ({
        ...prev,
        [collectionId]: uniqueUsers,
      }));
    });

    // Manejar cuando un usuario se une a una colección
    newSocket.on("collection_user_joined", ({ collectionId, userData }) => {
      console.log(`Usuario ${userData.name} unido a colección ${collectionId}`);

      setUsersInCollection((prev) => {
        const currentUsers = prev[collectionId] || [];

        // Verificar si el usuario ya está en la colección
        const exists = currentUsers.some(
          (user) => user.email === userData.email
        );

        if (exists) {
          // Actualizar los datos del usuario existente
          return {
            ...prev,
            [collectionId]: currentUsers.map((user) =>
              user.email === userData.email ? userData : user
            ),
          };
        }

        // Añadir el nuevo usuario
        return {
          ...prev,
          [collectionId]: [...currentUsers, userData],
        };
      });

      // Mostrar notificación solo si no es el usuario actual
      if (userData.email !== session.user.email) {
        toast.info(`${userData.name} se ha unido a la colección`);
      }
    });

    // Manejar cuando un usuario abandona una colección
    newSocket.on("collection_user_left", ({ collectionId, userData }) => {
      console.log(
        `Usuario ${userData.name} salió de colección ${collectionId}`
      );

      setUsersInCollection((prev) => {
        const currentUsers = prev[collectionId] || [];

        return {
          ...prev,
          [collectionId]: currentUsers.filter(
            (user) => user.email !== userData.email
          ),
        };
      });

      // Mostrar notificación solo si no es el usuario actual
      if (userData.email !== session.user.email) {
        toast.info(`${userData.name} ha salido de la colección`);
      }
    });

    // Manejar eventos de chat
    newSocket.on("message_history", (messages) => {
      // Convertir mensajes comprimidos al formato esperado por el frontend
      const formattedMessages = messages.map((msg) => ({
        id: msg.i || msg.id,
        sender: msg.n || msg.senderName,
        senderEmail: msg.e || msg.senderEmail,
        avatar: msg.img || msg.senderImage || "/placeholder-user.jpg",
        message: msg.c || msg.content,
        isSelf: (msg.e || msg.senderEmail) === session.user.email,
        timestamp: msg.t || msg.timestamp,
      }));

      setMessages(formattedMessages);
    });

    newSocket.on("new_message", (message) => {
      // Convertir mensaje comprimido al formato esperado por el frontend
      const formattedMessage = {
        id: message.i || message.id,
        sender: message.n || message.senderName,
        senderEmail: message.e || message.senderEmail,
        avatar: message.img || message.senderImage || "/placeholder-user.jpg",
        message: message.c || message.content,
        isSelf: (message.e || message.senderEmail) === session.user.email,
        timestamp: message.t || message.timestamp,
      };

      setMessages((prev) => [...prev, formattedMessage]);
    });

    // Manejar eventos de escritura
    newSocket.on("user_typing", ({ email, name }) => {
      if (email !== session.user.email) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(email, { name, timestamp: Date.now() });
          return newMap;
        });
      }
    });

    newSocket.on("user_stop_typing", ({ email }) => {
      if (email !== session.user.email) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(email);
          return newMap;
        });
      }
    });

    // Manejar evento de eliminación de workspace
    newSocket.on("workspace_deleted", (data) => {
      console.log("Workspace eliminado:", data);
      const { workspaceId, deletedBy } = data;
      const currentPath = window.location.pathname;

      // Mostrar notificación al usuario
      toast.error(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Espacio de trabajo eliminado</div>
          <div className="text-sm">
            El espacio de trabajo ha sido eliminado por{" "}
            {deletedBy?.name || "un administrador"}.
          </div>
        </div>,
        {
          duration: 5000,
        }
      );

      // Actualizar el estado global independientemente de dónde esté el usuario
      updateActiveWorkspace(null);

      // Eliminar el workspace del estado global para actualizar el sidebar
      setWorkspaces((prev) => {
        const updatedWorkspaces = prev.filter(
          (w) => w.id !== parseInt(workspaceId)
        );
        console.log(
          "Workspaces actualizados después de eliminación:",
          updatedWorkspaces
        );
        return updatedWorkspaces;
      });

      // Si estamos en el workspace eliminado, redirigir a la página principal inmediatamente
      if (currentPath.includes(`/workspaces/${workspaceId}`)) {
        console.log("Usuario en workspace eliminado, redirigiendo...");
        // Usar replace en lugar de push para evitar que el usuario pueda volver atrás
        window.location.href = "/";
      }
    });

    // Manejar evento de eliminación de colección
    newSocket.on("collection_deleted", (data) => {
      console.log("Colección eliminada:", data);
      const { workspaceId, collectionId, deletedBy } = data;
      const currentPath = window.location.pathname;

      // Mostrar notificación al usuario
      toast.error(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Colección eliminada</div>
          <div className="text-sm">
            La colección ha sido eliminada por{" "}
            {deletedBy?.name || "un administrador"}.
          </div>
        </div>,
        {
          duration: 5000,
        }
      );

      // Actualizar el estado global para eliminar la colección del workspace activo
      if (workspace?.id === parseInt(workspaceId)) {
        // Actualizar el workspace activo eliminando la colección
        updateActiveWorkspace((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            collections:
              prev.collections?.filter(
                (c) => c.id !== parseInt(collectionId)
              ) || [],
          };
        });

        // Actualizar todos los workspaces para mantener la consistencia
        setWorkspaces((prevWorkspaces) => {
          return prevWorkspaces.map((w) => {
            if (w.id === parseInt(workspaceId)) {
              return {
                ...w,
                collections:
                  w.collections?.filter(
                    (c) => c.id !== parseInt(collectionId)
                  ) || [],
              };
            }
            return w;
          });
        });
      }

      // Si estamos en la colección eliminada, redirigir inmediatamente al workspace
      if (
        currentPath.includes(
          `/workspaces/${workspaceId}/collection/${collectionId}`
        )
      ) {
        console.log("Usuario en colección eliminada, redirigiendo...");
        // Usar replace en lugar de router.push para asegurar una redirección inmediata
        window.location.href = `/workspaces/${workspaceId}`;
      }
    });

    // Manejar eventos de agenda/tareas
    newSocket.on("agenda_users_updated", (data) => {
      console.log("Usuarios de agenda actualizados:", data);
      setAgendaUsers(data.users || []);
    });

    // Los eventos de tareas solo muestran notificaciones
    // La actualización del estado se maneja en cada página específica
    newSocket.on("task_created", (data) => {
      console.log("Tarea creada:", data);
      if (data.createdBy?.email !== session.user.email) {
        toast.success(`Nueva tarea creada: ${data.task?.title}`, {
          description: `Por ${data.createdBy?.name || data.createdBy?.email}`,
        });
      }
    });

    newSocket.on("task_updated", (data) => {
      console.log("Tarea actualizada:", data);
      if (data.updatedBy?.email !== session.user.email) {
        toast.info(`Tarea actualizada: ${data.task?.title}`, {
          description: `Por ${data.updatedBy?.name || data.updatedBy?.email}`,
        });
      }
    });

    newSocket.on("task_deleted", (data) => {
      console.log("Tarea eliminada:", data);
      if (data.deletedBy?.email !== session.user.email) {
        toast.error(`Tarea eliminada`, {
          description: `Por ${data.deletedBy?.name || data.deletedBy?.email}`,
        });
      }
    });

    newSocket.on("task_moved", (data) => {
      console.log("Tarea movida:", data);
      if (data.movedBy?.email !== session.user.email) {
        toast.info(`Tarea movida: ${data.task?.title}`, {
          description: `De ${data.fromStatus} a ${data.toStatus} por ${
            data.movedBy?.name || data.movedBy?.email
          }`,
        });
      }
    });

    // Manejar errores del servidor
    newSocket.on("error", (error) => {
      console.error("Error del servidor:", error);
      toast.error(`Error: ${error.message || "Error de comunicación"}`);
    });

    // Limpiar al desmontar
    return () => {
      cleanupSocket();
    };
  }, [
    session?.user,
    workspace?.id,
    baseSocket,
    baseSocketConnected,
    cleanupSocket,
    createAuthToken,
  ]);

  // Función para unirse a una colección
  const joinCollection = useCallback(
    (collectionId) => {
      if (
        socketRef.current &&
        isConnected &&
        collectionId &&
        workspace?.id &&
        session?.user
      ) {
        console.log("Uniéndose a la colección:", collectionId);
        socketRef.current.emit("join_collection", workspace.id, collectionId, {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image || null,
        });
      }
    },
    [workspace?.id, session?.user, isConnected]
  );

  // Función para salir de una colección
  const leaveCollection = useCallback(
    (collectionId) => {
      if (socketRef.current && isConnected && collectionId && workspace?.id) {
        console.log("Saliendo de la colección:", collectionId);
        socketRef.current.emit("leave_collection", workspace.id, collectionId);
      }
    },
    [workspace?.id, isConnected]
  );

  // Función para enviar un mensaje
  const sendMessage = useCallback(
    (content) => {
      if (
        socketRef.current &&
        isConnected &&
        workspace?.id &&
        session?.user &&
        content
      ) {
        console.log("Enviando mensaje");
        socketRef.current.emit("new_message", {
          workspaceId: workspace.id,
          senderEmail: session.user.email,
          senderName: session.user.name,
          senderImage: session.user.image || null,
          content,
        });
        return true;
      }
      return false;
    },
    [workspace?.id, session?.user, isConnected]
  );

  // Función para indicar que el usuario está escribiendo
  const sendTyping = useCallback(() => {
    if (socketRef.current && isConnected && workspace?.id && session?.user) {
      socketRef.current.emit("user_typing", {
        workspaceId: workspace.id,
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [workspace?.id, session?.user, isConnected]);

  // Función para indicar que el usuario dejó de escribir
  const sendStopTyping = useCallback(() => {
    if (socketRef.current && isConnected && workspace?.id && session?.user) {
      socketRef.current.emit("user_stop_typing", {
        workspaceId: workspace.id,
        email: session.user.email,
        name: session.user.name,
      });
    }
  }, [workspace?.id, session?.user, isConnected]);

  // Función para solicitar usuarios conectados
  const requestConnectedUsers = useCallback(() => {
    if (socketRef.current && isConnected && workspace?.id) {
      console.log(
        "Solicitando usuarios conectados para workspace:",
        workspace.id
      );
      socketRef.current.emit("get_workspace_users", workspace.id);
    }
  }, [workspace?.id, isConnected]);

  // Funciones para agenda/tareas
  const joinAgenda = useCallback(() => {
    if (socketRef.current && isConnected && workspace?.id && session?.user) {
      console.log("Uniéndose a la agenda:", workspace.id);
      socketRef.current.emit("join_agenda", workspace.id, {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image || null,
      });
    }
  }, [workspace?.id, session?.user, isConnected]);

  const leaveAgenda = useCallback(() => {
    if (socketRef.current && isConnected && workspace?.id) {
      console.log("Saliendo de la agenda:", workspace.id);
      socketRef.current.emit("leave_agenda", workspace.id);
    }
  }, [workspace?.id, isConnected]);

  const emitTaskCreated = useCallback(
    (task) => {
      if (socketRef.current && isConnected && workspace?.id && session?.user) {
        console.log("Emitiendo tarea creada:", task);
        socketRef.current.emit("task_created", {
          workspaceId: workspace.id,
          task,
          createdBy: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image || null,
          },
        });
      }
    },
    [workspace?.id, session?.user, isConnected]
  );

  const emitTaskUpdated = useCallback(
    (task, changes = {}) => {
      if (socketRef.current && isConnected && workspace?.id && session?.user) {
        console.log("Emitiendo tarea actualizada:", task, changes);
        socketRef.current.emit("task_updated", {
          workspaceId: workspace.id,
          task,
          updatedBy: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image || null,
          },
          changes,
        });
      }
    },
    [workspace?.id, session?.user, isConnected]
  );

  const emitTaskDeleted = useCallback(
    (taskId) => {
      if (socketRef.current && isConnected && workspace?.id && session?.user) {
        console.log("Emitiendo tarea eliminada:", taskId);
        socketRef.current.emit("task_deleted", {
          workspaceId: workspace.id,
          taskId,
          deletedBy: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image || null,
          },
        });
      }
    },
    [workspace?.id, session?.user, isConnected]
  );

  const emitTaskMoved = useCallback(
    (taskId, fromStatus, toStatus, task) => {
      if (socketRef.current && isConnected && workspace?.id && session?.user) {
        console.log("Emitiendo tarea movida:", taskId, fromStatus, toStatus);
        socketRef.current.emit("task_moved", {
          workspaceId: workspace.id,
          taskId,
          fromStatus,
          toStatus,
          task,
          movedBy: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            image: session.user.image || null,
          },
        });
      }
    },
    [workspace?.id, session?.user, isConnected]
  );

  const requestAgendaUsers = useCallback(() => {
    if (socketRef.current && isConnected && workspace?.id) {
      console.log("Solicitando usuarios de la agenda:", workspace.id);
      socketRef.current.emit("get_agenda_users", workspace.id);
    }
  }, [workspace?.id, isConnected]);

  // Exponer el contexto
  const value = {
    socket: socketRef.current,
    isConnected,
    user: session?.user,
    connectedUsers,
    usersInCollection,
    messages,
    typingUsers: Array.from(typingUsers.values()),
    agendaUsers,
    joinCollection,
    leaveCollection,
    sendMessage,
    sendTyping,
    sendStopTyping,
    requestConnectedUsers,
    // Funciones de agenda/tareas
    joinAgenda,
    leaveAgenda,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitTaskMoved,
    requestAgendaUsers,
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
