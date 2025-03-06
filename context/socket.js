"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Creando el contexto para Socket.IO
const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Conectamos al servidor de WebSocket (ajustar la URL según sea necesario)
    const socketIo = io("http://localhost:3001");

    // Establecer el socket en el estado
    setSocket(socketIo);

    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      socketIo.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
