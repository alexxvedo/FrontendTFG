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
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef(null);
  const {
    socket,
    user: socketUser,
    requestConnectedUsers,
  } = useWorkspaceSocket();

  const lastMessageRef = useRef(null);
  const api = useApi();
  const { data: session } = useSession();
  const user = session?.user;

  // Solicitar usuarios conectados cuando se monte el componente
  useEffect(() => {
    if (socket && activeWorkspace?.id && requestConnectedUsers) {
      requestConnectedUsers();
    }
  }, [socket, activeWorkspace?.id, requestConnectedUsers]);

  // Manejar eventos de socket
  useEffect(() => {
    if (!socket || !activeWorkspace?.id || !user) return;

    const handleUsersConnected = (users) => {
      setOnlineUsers(users);
    };

    const handleUserTyping = ({ email, name }) => {
      if (email !== user.email) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(name);
          return newSet;
        });
      }
    };

    const handleUserStopTyping = ({ email, name }) => {
      if (email !== user.email) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
      }
    };

    const handleNewMessage = (message) => {
      // Si el mensaje no es del usuario actual, incrementar contador de no leídos
      if (message.senderEmail !== user.email) {
        if (document.hidden) {
          incrementUnreadMessages(message.workspaceId);
        }
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: message.id || Date.now(),
          sender: message.senderName,
          avatar: message.senderImage || "/placeholder-user.jpg",
          message: message.content,
          isSelf: message.senderEmail === user.email,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Suscribirse a eventos
    socket.on("users_connected", handleUsersConnected);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("new_message", handleNewMessage);

    // Limpiar eventos al desmontar
    return () => {
      socket.off("users_connected", handleUsersConnected);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, activeWorkspace?.id, user, incrementUnreadMessages]);

  // Manejar el estado de "escribiendo"
  const handleTyping = useCallback(() => {
    if (!socket || !activeWorkspace?.id || !user) return;

    socket.emit("user_typing", {
      workspaceId: activeWorkspace.id,
      email: user.email,
      name: user.name,
    });

    // Limpiar el timeout anterior si existe
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Establecer un nuevo timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("user_stop_typing", {
        workspaceId: activeWorkspace.id,
        email: user.email,
      });
    }, 1000);
  }, [socket, activeWorkspace?.id, user]);

  // Cargar mensajes iniciales
  const fetchMessages = useCallback(async () => {
    if (!activeWorkspace?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.chat.getWorkspaceChat(activeWorkspace.id);
      const chatData = response.data;

      const formattedMessages = chatData.messages.map((msg) => ({
        id: msg.id,
        sender: msg.sender.name || "Usuario desconocido",
        avatar: msg.sender.image || "/placeholder-user.jpg",
        message: msg.content,
        isSelf: msg.sender.email === user?.email,
        timestamp: msg.createdAt,
      }));

      setChatMessages(formattedMessages);
    } catch (error) {
      if (error.response?.status === 404) {
        setChatMessages([]);
        return;
      }
      console.error("Error obteniendo mensajes del chat:", error);
      setError(
        "No se pudieron cargar los mensajes. Por favor, intenta de nuevo más tarde."
      );
      toast.error("Error al cargar los mensajes del chat");
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id, user?.email]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Enviar mensaje
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user?.email || isSending || !socket) return;

    const messageContent = newMessage.trim();
    setIsSending(true);

    try {
      // Emitir el mensaje a través de WebSocket
      socket.emit("new_message", {
        workspaceId: activeWorkspace.id,
        senderEmail: user.email,
        senderName: user.name,
        senderImage: user.image,
        content: messageContent,
      });

      setNewMessage("");

      // Guardar en la base de datos
      await api.chat.sendMessage(
        activeWorkspace.id,
        messageContent,
        user.email
      );
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
            {typingUsers.size > 0 && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 animate-typing-indicator">
                {Array.from(typingUsers).join(", ")}{" "}
                {typingUsers.size === 1 ? "está" : "están"} escribiendo...
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
        {chatMessages.map((message, index) => (
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
        ))}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-zinc-200/20 dark:border-zinc-800/30 p-4 backdrop-blur-lg  relative z-10"
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
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700  backdrop-blur-sm p-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 text-zinc-900 dark:text-zinc-100"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={isSending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white h-10"
          >
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
