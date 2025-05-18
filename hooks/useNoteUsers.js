import { useState, useEffect, useCallback, useRef } from "react";
import { useWorkspaceSocket } from "@/components/workspace/workspace-socket-provider";
import { useSession } from "next-auth/react";

export function useNoteUsers(workspaceId, noteId, onContentUpdate) {
  const { socket, isConnected } = useWorkspaceSocket();
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [cursors, setCursors] = useState(new Map());
  const hasJoined = useRef(false);
  const currentNoteId = useRef(noteId);
  const mounted = useRef(false);

  // Efecto para manejar la conexión/desconexión de la nota
  useEffect(() => {
    if (!socket || !isConnected || !session?.user || !noteId) {
      return;
    }

    mounted.current = true;

    // Si cambiamos de nota, primero salimos de la anterior
    if (
      currentNoteId.current &&
      currentNoteId.current !== noteId &&
      hasJoined.current
    ) {
      socket.emit("leave_note", workspaceId, currentNoteId.current);
      hasJoined.current = false;
      if (mounted.current) {
        setCursors(new Map());
      }
    }

    currentNoteId.current = noteId;

    // Solo unirse a la nota si no estamos ya unidos
    if (!hasJoined.current) {
      console.log("Uniéndose a la nota:", {
        workspaceId,
        noteId,
        user: session.user.email,
      });

      socket.emit("join_note", workspaceId, noteId, {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      });
      hasJoined.current = true;
    }

    const handleNoteUsersUpdated = ({
      noteId: updatedNoteId,
      users: updatedUsers,
    }) => {
      if (updatedNoteId === noteId && mounted.current) {
        console.log("Usuarios actualizados:", updatedUsers);
        setUsers(updatedUsers || []);
      }
    };

    const handleCursorUpdated = ({
      noteId: updatedNoteId,
      userId,
      userData,
      cursor,
    }) => {
      if (
        updatedNoteId === noteId &&
        userData?.email !== session?.user?.email &&
        mounted.current
      ) {
        console.log("Cursor remoto actualizado:", {
          user: userData.email,
          cursor,
          userId,
        });
        setCursors((prev) => {
          const newCursors = new Map(prev);
          if (cursor) {
            newCursors.set(userId, { userData, cursor });
          } else {
            newCursors.delete(userId);
          }
          return newCursors;
        });
      }
    };

    const handleNoteContentUpdated = ({ noteId: updatedNoteId, content }) => {
      if (updatedNoteId === noteId && mounted.current) {
        onContentUpdate?.(content);
      }
    };

    socket.on("note_users_updated", handleNoteUsersUpdated);
    socket.on("cursor_updated", handleCursorUpdated);
    socket.on("note_content_updated", handleNoteContentUpdated);

    return () => {
      socket.off("note_users_updated", handleNoteUsersUpdated);
      socket.off("cursor_updated", handleCursorUpdated);
      socket.off("note_content_updated", handleNoteContentUpdated);
    };
  }, [socket, isConnected, workspaceId, noteId, session, onContentUpdate]);

  // Efecto para limpiar cuando el componente se desmonta
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (hasJoined.current && currentNoteId.current && socket) {
        socket.emit("leave_note", workspaceId, currentNoteId.current);
        hasJoined.current = false;
      }
    };
  }, [socket, workspaceId]);

  const updateCursor = useCallback(
    (cursorData) => {
      if (!socket || !isConnected || !session?.user || !mounted.current) {
        console.log("No se puede actualizar el cursor:", {
          socket: !!socket,
          connected: isConnected,
          noteId: !!noteId,
          session: !!session?.user,
          mounted: mounted.current,
        });
        return;
      }

      console.log("Enviando actualización de cursor:", {
        noteId,
        cursorData,
        user: session.user.email,
      });

      socket.emit("cursor_update", workspaceId, noteId, cursorData);
    },
    [socket, isConnected, workspaceId, noteId, session]
  );

  const updateContent = useCallback(
    (content) => {
      if (!socket || !isConnected || !session?.user || !mounted.current) return;
      socket.emit("note_content_update", workspaceId, noteId, content);
    },
    [socket, isConnected, workspaceId, noteId, session]
  );

  return {
    users,
    cursors,
    updateCursor,
    updateContent,
    isReady: isConnected && !!session?.user,
  };
}
