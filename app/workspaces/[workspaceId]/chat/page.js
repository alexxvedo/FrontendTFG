"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { MessageCircle, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/lib/api";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useWorkspaceSocket } from "@/components/workspace/workspace-socket-provider";
import { toast } from "sonner";

import Background from "@/components/background/background";
import { Separator } from "@/components/ui/separator";

export default function ChatPage() {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);
  const incrementUnreadMessages = useSidebarStore(
    (state) => state.incrementUnreadMessages
  );
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  const {
    socket,
    isConnected,
    user: socketUser,
    connectedUsers: onlineUsers,
    messages: chatMessages,
    typingUsers,
    sendMessage,
    sendTyping,
    sendStopTyping,
    requestConnectedUsers,
  } = useWorkspaceSocket();

  const lastMessageRef = useRef(null);
  const api = useApi();
  const { data: session } = useSession();
  const user = session?.user;

  // Efecto para marcar como cargado cuando tengamos conexión
  useEffect(() => {
    if (isConnected && socket && activeWorkspace?.id) {
      setIsLoading(false);
    }
  }, [isConnected, socket, activeWorkspace?.id]);

  // Solicitar usuarios conectados cuando se monte el componente
  useEffect(() => {
    if (socket && activeWorkspace?.id && requestConnectedUsers) {
      requestConnectedUsers();
    }
  }, [socket, activeWorkspace?.id, requestConnectedUsers]);

  // Efecto para desplazarse al último mensaje
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Efecto para manejar el incremento de mensajes no leídos
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && chatMessages.length > 0) {
        const lastMessage = chatMessages[chatMessages.length - 1];
        if (!lastMessage.isSelf) {
          incrementUnreadMessages(activeWorkspace?.id);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [chatMessages, incrementUnreadMessages, activeWorkspace?.id]);

  // Manejar el estado de "escribiendo"
  const handleTyping = useCallback(() => {
    if (!socket || !isConnected || !activeWorkspace?.id || !user) return;

    // Enviar evento de escritura
    sendTyping();

    // Limpiar el timeout anterior si existe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Establecer un nuevo timeout para enviar "dejó de escribir" después de 2 segundos
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping();
      typingTimeoutRef.current = null;
    }, 2000);
  }, [socket, isConnected, activeWorkspace?.id, user, sendTyping, sendStopTyping]);

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending || !isConnected) return;
    
    try {
      setIsSending(true);
      
      // Limpiar el estado de "escribiendo"
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      sendStopTyping();
      
      // Enviar mensaje a través del socket
      const sent = sendMessage(newMessage.trim());
      
      if (sent) {
        // Limpiar el campo de mensaje
        setNewMessage("");
      } else {
        toast.error("No se pudo enviar el mensaje. Verifica tu conexión.");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      toast.error("Error al enviar el mensaje");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-screen" />;
  }

  return (
    <div className="flex flex-col h-screen dark:bg-[#0A0A0F] relative">
      <Background />

      <div className="border-b border-zinc-200/20 dark:border-zinc-800/30 p-4 backdrop-blur-xl relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
              Chat
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {typingUsers.length > 0 && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 animate-typing-indicator">
                {typingUsers.map(u => u.name).join(", ")}{" "}
                {typingUsers.length === 1 ? "está" : "están"} escribiendo...
              </div>
            )}
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Users className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <span>{onlineUsers.length} online</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-zinc-500 dark:text-zinc-400">
              <p>No hay mensajes aún.</p>
              <p>¡Sé el primero en enviar un mensaje!</p>
            </div>
          </div>
        ) : (
          chatMessages.map((message, index) => (
            <div
              key={message.id}
              ref={index === chatMessages.length - 1 ? lastMessageRef : null}
              className={cn(
                "flex items-start gap-2",
                message.isSelf && "flex-row-reverse"
              )}
            >
              <Image
                src={message.avatar}
                alt={message.sender}
                width={32}
                height={32}
                className="rounded-full border-2 border-white/20 shadow-md"
              />
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3 shadow-sm",
                  message.isSelf
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white"
                    : "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    message.isSelf
                      ? "text-white/90"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {message.sender}
                </div>
                <div className="text-sm">{message.message}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-zinc-200/20 dark:border-zinc-800/30 p-4 backdrop-blur-lg relative z-10"
      >
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm p-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 text-zinc-900 dark:text-zinc-100"
            disabled={isSending || !isConnected}
          />
          <Button
            type="submit"
            disabled={isSending || !isConnected}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-10"
          >
            Enviar
          </Button>
        </div>
        {!isConnected && (
          <div className="text-xs text-red-500 mt-1">
            Reconectando... No puedes enviar mensajes en este momento.
          </div>
        )}
      </form>
    </div>
  );
}
