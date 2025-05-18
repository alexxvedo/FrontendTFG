"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

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

// Proveedor del contexto de socket
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

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
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket desconectado:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Error de conexión:", error.message);
      setConnectionError(error.message);
      setReconnectAttempts((prev) => prev + 1);
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconectado después de ${attemptNumber} intentos`);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Intento de reconexión #${attemptNumber}`);
      setReconnectAttempts(attemptNumber);
    });

    socketInstance.on("error", (error) => {
      console.error("Error del servidor:", error);
      // Mostrar errores del servidor al usuario si es necesario
    });

    // Guardar instancia en el estado
    setSocket(socketInstance);

    // Limpiar al desmontar
    return () => {
      socketInstance.disconnect();
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("connect_error");
      socketInstance.off("reconnect");
      socketInstance.off("reconnect_attempt");
      socketInstance.off("error");
    };
  }, []);

  // Crear un objeto con el socket y el estado de conexión
  const value = {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    // Función para crear un token JWT para autenticación
    createAuthToken: (user) => {
      if (!user) return null;

      // En producción, esto debería hacerse en el backend
      // Aquí es solo para desarrollo
      const token = `${user.id}.${user.email}.${user.name}`;
      return token;
    },
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
