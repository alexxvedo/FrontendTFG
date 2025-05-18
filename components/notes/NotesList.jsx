import { useRouter, useParams } from "next/navigation";
import { FileText, Calendar, Clock, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { motion } from "framer-motion";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import ReactMarkdown from 'react-markdown';

export default function NotesList({ notes = [] }) {
  const router = useRouter();
  const params = useParams();
  const { activeCollection } = useCollectionStore();
  const [hoveredNote, setHoveredNote] = useState(null);

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
      if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
        try {
          content = JSON.parse(content);
        } catch (e) {
          // Si falla el parsing, usar el contenido original
          return content;
        }
      }
      
      // Si es un objeto con estructura Tiptap
      if (content.type === 'doc' && Array.isArray(content.content)) {
        // Extraer texto de todos los nodos de texto
        return extractTextFromNodes(content.content);
      }
      
      // Si es un string normal
      if (typeof content === 'string') {
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
    
    return nodes.map(node => {
      // Si es un nodo de texto, devolver su texto
      if (node.type === 'text' && node.text) {
        return node.text;
      }
      
      // Si es un párrafo u otro nodo con contenido, procesar recursivamente
      if (node.content && Array.isArray(node.content)) {
        return extractTextFromNodes(node.content);
      }
      
      // Para otros tipos de nodos (listas, imágenes, etc.)
      if (node.type) {
        switch (node.type) {
          case 'paragraph':
            const paragraphText = node.content ? extractTextFromNodes(node.content) : '';
            return paragraphText + ' ';
          case 'heading':
            const headingText = node.content ? extractTextFromNodes(node.content) : '';
            return headingText + ' ';
          case 'bulletList':
          case 'orderedList':
            const listText = node.content ? extractTextFromNodes(node.content) : '';
            return listText;
          case 'listItem':
            const itemText = node.content ? extractTextFromNodes(node.content) : '';
            return '• ' + itemText + ' ';
          default:
            return node.content ? extractTextFromNodes(node.content) : '';
        }
      }
      
      return "";
    }).join('');
  };

  // Función para truncar texto
  const truncateText = (text, maxLength = 120) => {
    if (!text) return "";
    
    // Si parece ser contenido de Tiptap, extraer el texto
    if (typeof text === 'string' && (text.includes('"type":"doc"') || text.includes('"type": "doc"'))) {
      text = extractTextFromTiptap(text);
    } else if (typeof text === 'object') {
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => setHoveredNote(note.id)}
            onMouseLeave={() => setHoveredNote(null)}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-[#0A0A0F]/90 dark:to-[#0A0A0F]/70 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 transition-all duration-300"
          >
            {/* Orbes de fondo con animación */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute bottom-10 -left-20 w-40 h-40 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/5 to-pink-900/5 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Contenido de la nota */}
            <div 
              className="relative p-5 cursor-pointer h-full flex flex-col"
              onClick={() => handleEditNote(note.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-1.5">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-medium text-zinc-900 dark:text-white truncate max-w-[180px]">
                    {note.noteName || note.title || "Nota sin título"}
                  </h3>
                </div>
                
                <div className={`flex items-center gap-1 transition-opacity duration-200 ${hoveredNote === note.id ? 'opacity-100' : 'opacity-0'}`}>
                  <button 
                    className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNote(note.id);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 mb-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 prose prose-invert max-w-none prose-p:my-2 prose-headings:my-2 prose-li:my-1">
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => <p className="my-2 leading-relaxed" {...props} />,
                      h1: ({node, ...props}) => <h1 className="text-base font-bold" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-base font-semibold" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-medium" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
                      li: ({node, ...props}) => <li className="ml-2" {...props} />,
                    }}
                  >
                    {note.content || "Sin contenido"}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(note.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{note.updatedAt ? "Editada" : "Nueva"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {notes.length === 0 && (
          <div className="col-span-full text-center py-8 text-zinc-500 dark:text-zinc-400">
            No hay notas en esta colección
          </div>
        )}
      </div>
    </motion.div>
  );
}
