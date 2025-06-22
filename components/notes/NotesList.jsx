import { useRouter, useParams } from "next/navigation";
import {
  FileText,
  Calendar,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { motion } from "framer-motion";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import NotePreview from "./NotePreview";

export default function NotesList({ notes = [] }) {
  const router = useRouter();
  const params = useParams();
  const { activeCollection } = useCollectionStore();
  const [hoveredNote, setHoveredNote] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);

  const handleEditNote = (noteId) => {
    router.push(
      `/workspaces/${params.workspaceId}/collection/${activeCollection.id}/notes/${noteId}`
    );
  };

  // Función para extraer texto plano del contenido JSON de Tiptap
  const extractTextFromTiptap = (content) => {
    if (!content) return "";

    try {
      // Si es string pero parece JSON, intentar parsearlo
      if (
        typeof content === "string" &&
        (content.startsWith("{") || content.startsWith("["))
      ) {
        try {
          content = JSON.parse(content);
        } catch (e) {
          // Si falla el parsing, usar el contenido original
          return content;
        }
      }

      // Si es un objeto con estructura Tiptap
      if (content.type === "doc" && Array.isArray(content.content)) {
        // Extraer texto de todos los nodos de texto
        return extractTextFromNodes(content.content);
      }

      // Si es un string normal
      if (typeof content === "string") {
        return content;
      }

      // Si no podemos procesarlo, devolver representación como string
      return String(content).substring(0, 150);
    } catch (error) {
      console.error("Error extracting text from Tiptap content:", error);
      return "Error al mostrar contenido";
    }
  };

  // Función recursiva para extraer texto de los nodos
  const extractTextFromNodes = (nodes) => {
    if (!Array.isArray(nodes)) return "";

    return nodes
      .map((node) => {
        // Si es un nodo de texto, devolver su texto
        if (node.type === "text" && node.text) {
          return node.text;
        }

        // Si es un párrafo u otro nodo con contenido, procesar recursivamente
        if (node.content && Array.isArray(node.content)) {
          return extractTextFromNodes(node.content);
        }

        // Para otros tipos de nodos (listas, imágenes, etc.)
        if (node.type) {
          switch (node.type) {
            case "paragraph":
              const paragraphText = node.content
                ? extractTextFromNodes(node.content)
                : "";
              return paragraphText + " ";
            case "heading":
              const headingText = node.content
                ? extractTextFromNodes(node.content)
                : "";
              return headingText + " ";
            case "bulletList":
            case "orderedList":
              const listText = node.content
                ? extractTextFromNodes(node.content)
                : "";
              return listText;
            case "listItem":
              const itemText = node.content
                ? extractTextFromNodes(node.content)
                : "";
              return "• " + itemText + " ";
            default:
              return node.content ? extractTextFromNodes(node.content) : "";
          }
        }

        return "";
      })
      .join("");
  };

  // Función para truncar texto
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "";

    // Si parece ser contenido de Tiptap, extraer el texto
    if (
      typeof text === "string" &&
      (text.includes('"type":"doc"') || text.includes('"type": "doc"'))
    ) {
      text = extractTextFromTiptap(text);
    } else if (typeof text === "object") {
      text = extractTextFromTiptap(text);
    }

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha desconocida";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => {
          const isExpanded = expandedNote === note.id;
          const pathParts = window.location.pathname.split("/");
          const workspaceId = pathParts[2];
          const collectionId = pathParts[4];

          return (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group relative bg-zinc-900/50 hover:bg-zinc-900/70 border border-zinc-800/50 rounded-xl p-6 transition-all duration-200 cursor-pointer"
              onClick={() => setExpandedNote(isExpanded ? null : note.id)}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <h3 className="font-medium text-zinc-100 text-lg">
                        {note.title || note.noteName || "Sin título"}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(note.createdAt).toLocaleTimeString(
                            "es-ES",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/workspaces/${workspaceId}/collection/${collectionId}/notes/${note.id}`}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Abrir
                  </Link>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? "max-h-[500px]" : "max-h-[150px]"
                  }`}
                >
                  <div className="prose prose-sm prose-invert max-w-none prose-img:rounded-lg prose-img:mx-auto prose-img:max-h-[300px] prose-img:object-contain">
                    <NotePreview content={note.content} />
                  </div>
                </div>

                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none" />
                )}
              </div>
            </motion.div>
          );
        })}

        {notes.length === 0 && (
          <div className="col-span-full text-center py-8 text-zinc-500 dark:text-zinc-400">
            No hay notas en esta colección
          </div>
        )}
      </div>
    </motion.div>
  );
}
