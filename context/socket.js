"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

// URL del servidor WebSocket
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

// Configuración avanzada para Socket.IO
const socketOptions = {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
  transports: ["websocket", "polling"],
  // Añadir retry para operaciones fallidas
  retryOnError: true,
};

// Crear contexto para el socket
const SocketContext = createContext(null);

// Hook personalizado para usar el socket
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket debe usarse dentro de un SocketProvider");
  }
  return context;
};

// Hook para suscribirse a eventos del socket con limpieza automática
export const useSocketEvent = (eventName, callback) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

// Proveedor del contexto de socket
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [activeUsers, setActiveUsers] = useState({});
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    if (socket) {
      setIsReconnecting(true);
      socket.connect();
      toast.loading("Intentando reconectar...");
    }
  }, [socket]);

  // Inicializar el socket
  useEffect(() => {
    // Crear instancia de socket
    const socketInstance = io(SOCKET_URL, socketOptions);

    // Manejar eventos de conexión
    socketInstance.on("connect", () => {
      console.log("Socket conectado con ID:", socketInstance.id);
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
      setIsReconnecting(false);

      // Notificar al usuario
      if (isReconnecting) {
        toast.dismiss();
        toast.success("Conexión restablecida");
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket desconectado:", reason);
      setIsConnected(false);

      // Mostrar notificación según el motivo
      if (reason === "io server disconnect") {
        toast.error("El servidor ha cerrado la conexión");
      } else if (reason === "transport close") {
        toast.error("Conexión perdida. Intentando reconectar...");
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Error de conexión:", error.message);
      setConnectionError(error.message);
      setReconnectAttempts((prev) => prev + 1);

      // Mostrar error específico al usuario
      if (reconnectAttempts > 5) {
        toast.error(`Error de conexión: ${error.message}`);
      }
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconectado después de ${attemptNumber} intentos`);
      setIsConnected(true);
      setConnectionError(null);
      setIsReconnecting(false);
      toast.dismiss();
      toast.success("Conexión restablecida");
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Intento de reconexión #${attemptNumber}`);
      setReconnectAttempts(attemptNumber);
      setIsReconnecting(true);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("Falló la reconexión después de todos los intentos");
      setIsReconnecting(false);
      toast.dismiss();
      toast.error("No se pudo reconectar. Intente recargar la página.");
    });

    socketInstance.on("error", (error) => {
      console.error("Error del servidor:", error);
      // Mostrar errores del servidor al usuario
      toast.error(`Error: ${error.message || "Error del servidor"}`);
    });

    // Manejar actualizaciones de usuarios activos
    socketInstance.on("active_users_updated", (data) => {
      setActiveUsers(data);
    });

    // Guardar instancia en el estado
    setSocket(socketInstance);

    // Limpiar al desmontar
    return () => {
      toast.dismiss();
      socketInstance.disconnect();
      socketInstance.off();
    };
  }, [isReconnecting, reconnectAttempts]);

  // Función para crear un token JWT para autenticación
  const createAuthToken = useCallback((user) => {
    if (!user) return null;

    try {
      // Crear un token más seguro con expiración
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora de expiración
      };

      // En un entorno real, esto debería hacerse en el backend
      // Esta implementación es solo para desarrollo
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = btoa(`${header}.${encodedPayload}`);

      return `${header}.${encodedPayload}.${signature}`;
    } catch (error) {
      console.error("Error al crear token:", error);
      return null;
    }
  }, []);

  // Función para manejar errores de operaciones de socket
  const handleSocketOperation = useCallback(
    (operation, data, onSuccess, onError) => {
      if (!socket || !isConnected) {
        toast.error("No hay conexión con el servidor");
        onError && onError(new Error("No hay conexión"));
        return;
      }

      try {
        // Timeout para detectar operaciones que no responden
        const timeoutId = setTimeout(() => {
          toast.error(
            `La operación ${operation} ha excedido el tiempo de espera`
          );
          onError && onError(new Error("Timeout"));
        }, 10000);

        // Ejecutar la operación
        socket.emit(operation, data, (response) => {
          clearTimeout(timeoutId);

          if (response && response.error) {
            toast.error(`Error: ${response.error}`);
            onError && onError(new Error(response.error));
          } else {
            onSuccess && onSuccess(response);
          }
        });
      } catch (error) {
        console.error(`Error en operación ${operation}:`, error);
        toast.error(`Error en la operación: ${error.message}`);
        onError && onError(error);
      }
    },
    [socket, isConnected]
  );

  // Crear un objeto con el socket y el estado de conexión
  const value = {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    isReconnecting,
    activeUsers,
    reconnect,
    createAuthToken,
    handleSocketOperation,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
