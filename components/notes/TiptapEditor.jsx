"use client";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  TooltipProvider,
  TooltipContent as TooltipContentProvider,
  TooltipTrigger as TooltipTriggerProvider,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Underline as UnderlineIcon,
  Highlighter,
  Type,
  MoreHorizontal,
  Palette,
  FileDown,
  Printer,
  FileText,
} from "lucide-react";

const COLORS = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
];

// Función para exportar a PDF
const exportToPDF = async (editor, title = "Documento") => {
  try {
    // Importación dinámica para evitar errores de SSR
    const jsPDF = (await import("jspdf")).default;
    const html2canvas = (await import("html2canvas")).default;

    // Obtener el contenido del editor
    const editorElement = document.querySelector(".ProseMirror");
    if (!editorElement) {
      toast.error("No se pudo encontrar el contenido del editor");
      return;
    }

    // Crear un contenedor temporal para el contenido
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "210mm"; // A4 width
    tempContainer.style.padding = "20mm";
    tempContainer.style.backgroundColor = "white";
    tempContainer.style.fontFamily = "Arial, sans-serif";
    tempContainer.style.fontSize = "14px";
    tempContainer.style.lineHeight = "1.6";
    tempContainer.style.color = "#000000";

    // Clonar el contenido del editor
    const clonedContent = editorElement.cloneNode(true);
    tempContainer.appendChild(clonedContent);

    // Aplicar estilos específicos para PDF
    const style = document.createElement("style");
    style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      .ProseMirror {
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        background: white !important;
        color: #000000 !important;
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
      }
      
      h1 { 
        font-size: 24px !important; 
        margin: 20px 0 10px 0 !important; 
        font-weight: bold !important;
        color: #000000 !important;
      }
      
      h2 { 
        font-size: 20px !important; 
        margin: 16px 0 8px 0 !important; 
        font-weight: bold !important;
        color: #000000 !important;
      }
      
      h3 { 
        font-size: 16px !important; 
        margin: 12px 0 6px 0 !important; 
        font-weight: bold !important;
        color: #000000 !important;
      }
      
      p { 
        margin: 8px 0 !important; 
        color: #000000 !important;
      }
      
      ul, ol { 
        margin: 8px 0 !important; 
        padding-left: 20px !important; 
        color: #000000 !important;
      }
      
      li {
        margin: 4px 0 !important;
        color: #000000 !important;
      }
      
      blockquote { 
        margin: 12px 0 !important; 
        padding-left: 16px !important; 
        border-left: 4px solid #ccc !important; 
        font-style: italic !important; 
        color: #000000 !important;
      }
      
      table { 
        border-collapse: collapse !important; 
        width: 100% !important; 
        margin: 12px 0 !important; 
      }
      
      td, th { 
        border: 1px solid #ccc !important; 
        padding: 8px !important; 
        text-align: left !important;
        color: #000000 !important;
      }
      
      th { 
        background-color: #f5f5f5 !important; 
        font-weight: bold !important; 
      }
      
      img { 
        max-width: 100% !important; 
        height: auto !important; 
        margin: 12px 0 !important; 
        display: block !important;
      }
      
      code {
        background-color: #f5f5f5 !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        font-family: monospace !important;
        color: #000000 !important;
      }
      
      pre {
        background-color: #f5f5f5 !important;
        padding: 12px !important;
        border-radius: 4px !important;
        margin: 12px 0 !important;
        overflow-x: auto !important;
      }
      
      pre code {
        background: none !important;
        padding: 0 !important;
      }
      
      strong {
        font-weight: bold !important;
        color: #000000 !important;
      }
      
      em {
        font-style: italic !important;
        color: #000000 !important;
      }
      
      u {
        text-decoration: underline !important;
        color: #000000 !important;
      }
      
      s {
        text-decoration: line-through !important;
        color: #000000 !important;
      }
      
      a {
        color: #0066cc !important;
        text-decoration: underline !important;
      }
      
      mark {
        background-color: #ffff00 !important;
        color: #000000 !important;
        padding: 1px 2px !important;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(tempContainer);

    // Esperar un momento para que se apliquen los estilos
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generar el canvas con opciones mejoradas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      removeContainer: false,
      foreignObjectRendering: false,
      imageTimeout: 0,
      ignoreElements: (element) => {
        // Ignorar imágenes que no se pueden cargar
        if (
          element.tagName === "IMG" &&
          element.src &&
          element.src.startsWith("http")
        ) {
          return true;
        }
        return false;
      },
    });

    // Crear el PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Añadir la primera página
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    // Añadir páginas adicionales si es necesario
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    // Limpiar
    document.body.removeChild(tempContainer);
    document.head.removeChild(style);

    // Descargar el PDF
    pdf.save(`${title}.pdf`);
    toast.success("PDF exportado correctamente");
  } catch (error) {
    console.error("Error al exportar PDF:", error);
    toast.error("Error al exportar el PDF: " + error.message);
  }
};

// Función para calcular el color de contraste
const getContrastColor = (hexColor) => {
  // Convertir el color hex a RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calcular la luminancia (fórmula estándar)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Retornar blanco o negro según la luminancia
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

// Mapa para mantener un registro de colores asignados
const usedColors = new Map();

// Función para obtener un color único para cada usuario
const getColorForUser = (user) => {
  if (!user) return COLORS[0];

  const userId = user.email || user.name || "anonymous";

  // Si el usuario ya tiene un color asignado, devolver ese color
  if (usedColors.has(userId)) {
    return usedColors.get(userId);
  }

  // Obtener todos los colores actualmente en uso
  const usedColorSet = new Set(usedColors.values());

  // Encontrar el primer color disponible
  const availableColor =
    COLORS.find((color) => !usedColorSet.has(color)) || COLORS[0];

  // Si todos los colores están en uso, liberar los colores de usuarios desconectados
  if (usedColorSet.size >= COLORS.length) {
    const connectedUsers = new Set(
      Array.from(provider?.awareness?.getStates().values() || []).map(
        (state) => state.user?.email || state.user?.name || "anonymous"
      )
    );

    // Limpiar colores de usuarios desconectados
    for (const [storedUserId, color] of usedColors.entries()) {
      if (!connectedUsers.has(storedUserId)) {
        usedColors.delete(storedUserId);
      }
    }
  }

  // Asignar y guardar el color para este usuario
  usedColors.set(userId, availableColor);
  return availableColor;
};

// Función para limpiar el color cuando un usuario se desconecta
const cleanupUserColor = (user) => {
  if (!user) return;
  const userId = user.email || user.name || "anonymous";
  usedColors.delete(userId);
};

const getInitials = (name) => {
  if (!name) return "?";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return initials.toUpperCase();
};

const TiptapEditor = ({
  content: initialContent,
  onChange,
  placeholder = "Empieza a escribir...",
  noteId,
  noteTitle = "Documento",
}) => {
  const { data: session } = useSession();
  const [provider, setProvider] = useState(null);
  const [ydoc] = useState(() => new Y.Doc());
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tableSize, setTableSize] = useState({ rows: 3, cols: 3 });
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });
  const [lastSavedContent, setLastSavedContent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estado para controlar si el contenido inicial ya se cargó
  const [initialContentLoaded, setInitialContentLoaded] = useState(false);

  // Inicializar el provider
  useEffect(() => {
    if (!session?.user?.email) return;

    const userColor = getColorForUser(session.user);
    const wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234",
      `note.${noteId}`,
      ydoc,
      {
        params: {
          user: {
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            color: userColor,
          },
        },
      }
    );

    // Establecer el estado inicial del usuario
    wsProvider.awareness.setLocalStateField("user", {
      name: session.user.name,
      color: userColor,
      avatar: session.user.image,
    });

    setProvider(wsProvider);

    return () => {
      cleanupUserColor(session.user);
      wsProvider.destroy();
    };
  }, [noteId, session]);

  // Función para guardar el contenido
  const saveContent = async (contentToSave) => {
    if (!noteId || noteId === "new" || isSaving) return;

    try {
      setIsSaving(true);
      const contentString =
        typeof contentToSave === "object"
          ? JSON.stringify(contentToSave)
          : contentToSave;

      await api.notes.update(
        window.location.pathname.split("/")[2], // workspaceId
        window.location.pathname.split("/")[4], // collectionId
        parseInt(noteId),
        {
          content: contentString,
        }
      );

      setLastSavedContent(contentString);
      console.log("Contenido guardado automáticamente");
    } catch (error) {
      console.error("Error al guardar automáticamente:", error);
      toast.error("Error al guardar automáticamente");
    } finally {
      setIsSaving(false);
    }
  };

  // Configurar el autoguardado
  useEffect(() => {
    if (!noteId || noteId === "new") return;

    const interval = setInterval(() => {
      if (!editor) return;

      const currentContent = editor.getJSON();
      const currentContentString = JSON.stringify(currentContent);

      if (currentContentString !== lastSavedContent) {
        saveContent(currentContent);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [noteId, lastSavedContent]);

  // Actualizar lastSavedContent cuando se carga el contenido inicial
  useEffect(() => {
    if (initialContent) {
      const contentString =
        typeof initialContent === "object"
          ? JSON.stringify(initialContent)
          : initialContent;
      setLastSavedContent(contentString);
    }
  }, []);

  // Manejar cambios en el editor
  const handleUpdate = ({ editor }) => {
    const json = editor.getJSON();
    onChange(json);
  };

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          codeBlock: {
            HTMLAttributes: {
              class:
                "bg-muted rounded-lg p-4 font-mono text-sm my-4 overflow-x-auto border border-border",
            },
          },
          history: false,
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight.configure({
          multicolor: true,
        }),
        Image.configure({
          HTMLAttributes: {
            class: "rounded-lg border border-border max-w-full",
          },
        }),
        Link.configure({
          openOnClick: true,
          HTMLAttributes: {
            class:
              "text-primary underline hover:text-primary/80 cursor-pointer",
          },
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: "border-collapse table-auto w-full my-4",
          },
        }),
        TableRow.configure({
          HTMLAttributes: {
            class: "border-b border-border",
          },
        }),
        TableHeader.configure({
          HTMLAttributes: {
            class:
              "border-b-2 border-border bg-muted font-semibold text-left p-3",
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: "border border-border p-3",
          },
        }),
        Color,
        TextStyle,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
        HorizontalRule.configure({
          HTMLAttributes: {
            class: "border-t-2 border-border my-8",
          },
        }),
        ...(provider
          ? [
              Collaboration.configure({
                document: ydoc,
              }),
              CollaborationCursor.configure({
                provider: provider,
                user: session?.user
                  ? {
                      name: session.user.name,
                      color: getColorForUser(session.user),
                      avatar: session.user.image,
                    }
                  : null,
              }),
            ]
          : []),
      ],
      content: provider ? undefined : initialContent, // Solo usar contenido inicial si no hay provider de Y.js
      onUpdate: handleUpdate,
      editorProps: {
        attributes: {
          class:
            "editor-content focus:outline-none min-h-[calc(100vh-200px)] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-none sm:max-w-4xl mx-auto w-full",
        },
      },
    },
    [provider, ydoc, session?.user]
  );

  // Cargar contenido inicial una vez que el editor esté listo
  useEffect(() => {
    if (editor && initialContent && !initialContentLoaded) {
      if (provider) {
        // Con provider Y.js - esperar conexión
        const checkConnection = () => {
          console.log("🔍 Verificando conexión Y.js...", {
            wsconnected: provider.wsconnected,
            noteId,
            hasInitialContent: !!initialContent,
          });

          if (provider.wsconnected) {
            // Verificar si el documento Y.js está vacío
            const yFragment = ydoc.get("prosemirror");
            console.log("📊 Estado del documento Y.js:", {
              fragmentLength: yFragment.length,
              noteId,
            });

            // Si el documento colaborativo está vacío, cargar el contenido inicial
            if (yFragment.length === 0 && initialContent) {
              console.log(
                "📝 Cargando contenido inicial en Y.js desde BD:",
                initialContent
              );

              // Usar setContent para cargar el contenido inicial
              editor.commands.setContent(initialContent);
              setInitialContentLoaded(true);

              console.log("✅ Contenido inicial cargado en Y.js");
            } else if (yFragment.length > 0) {
              // El documento ya tiene contenido colaborativo
              console.log("📚 Documento Y.js ya tiene contenido colaborativo");
              setInitialContentLoaded(true);
            } else {
              // Documento vacío y sin contenido inicial válido
              console.log("📄 Documento vacío, sin contenido inicial");
              setInitialContentLoaded(true);
            }
          } else {
            console.log("⏳ Esperando conexión WebSocket...");
            // Reintentar en 100ms
            setTimeout(checkConnection, 100);
          }
        };

        checkConnection();
      } else {
        // Sin provider Y.js - cargar contenido directamente
        console.log("📝 Cargando contenido inicial sin Y.js:", initialContent);
        editor.commands.setContent(initialContent);
        setInitialContentLoaded(true);
      }
    }
  }, [editor, provider, initialContent, initialContentLoaded, ydoc, noteId]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar mejorada y más limpia */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border"
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          {/* Grupo principal de herramientas */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {/* Formato de texto */}
            <div className="flex items-center gap-1 mr-1 sm:mr-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                  editor.isActive("bold")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                  editor.isActive("italic")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                  editor.isActive("underline")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <UnderlineIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:flex ${
                  editor.isActive("strike")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Strikethrough className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:flex ${
                  editor.isActive("highlight")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Highlighter className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <Separator
              orientation="vertical"
              className="h-4 sm:h-6 mx-1 sm:mx-2"
            />

            {/* Títulos */}
            <div className="flex items-center gap-1 mr-1 sm:mr-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`h-7 sm:h-8 px-1 sm:px-2 text-xs font-semibold ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                H1
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`h-7 sm:h-8 px-1 sm:px-2 text-xs font-semibold ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                H2
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`h-7 sm:h-8 px-1 sm:px-2 text-xs font-semibold hidden sm:flex ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                H3
              </Button>
            </div>

            <Separator
              orientation="vertical"
              className="h-4 sm:h-6 mx-1 sm:mx-2"
            />

            {/* Listas y alineación */}
            <div className="flex items-center gap-1 mr-1 sm:mr-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                  editor.isActive("bulletList")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 ${
                  editor.isActive("orderedList")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <ListOrdered className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 hidden sm:flex ${
                  editor.isActive("blockquote")
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <Quote className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {/* Alineación - Solo en pantallas grandes */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className={`h-8 w-8 p-0 ${
                  editor.isActive({ textAlign: "left" })
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                className={`h-8 w-8 p-0 ${
                  editor.isActive({ textAlign: "center" })
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className={`h-8 w-8 p-0 ${
                  editor.isActive({ textAlign: "right" })
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Insertar elementos - Solo en pantallas medianas y grandes */}
            <div className="hidden md:flex items-center gap-1">
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="link" className="text-sm font-medium">
                        Enlace
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="link"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://ejemplo.com"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => {
                            if (linkUrl) {
                              editor
                                .chain()
                                .focus()
                                .setLink({ href: linkUrl })
                                .run();
                              setLinkUrl("");
                            }
                          }}
                          disabled={!linkUrl}
                          size="sm"
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-accent"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image" className="text-sm font-medium">
                        URL de la imagen
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="image"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => {
                            if (imageUrl) {
                              editor
                                .chain()
                                .focus()
                                .setImage({ src: imageUrl })
                                .run();
                              setImageUrl("");
                            }
                          }}
                          disabled={!imageUrl}
                          size="sm"
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Usuarios conectados y exportar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botón de exportar PDF */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => exportToPDF(editor, noteTitle)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-accent"
                >
                  <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar a PDF</TooltipContent>
            </Tooltip>

            {/* Historial - Solo disponible en modo individual */}
            {!provider && (
              <>
                <div className="hidden sm:flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 p-0 hover:bg-accent disabled:opacity-50"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 p-0 hover:bg-accent disabled:opacity-50"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-6 hidden sm:block"
                />
              </>
            )}

            {/* Avatares de usuarios conectados */}
            <div className="flex -space-x-1 sm:-space-x-2">
              {Array.from(provider?.awareness?.getStates().values() || []).map(
                (state) => {
                  const user = state.user || {};
                  const uniqueKey = `${state.clientID}-${
                    user.email || user.name || "anonymous"
                  }`;
                  const userColor = user.color || getColorForUser(user);

                  return (
                    <TooltipProvider key={uniqueKey}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-background hover:scale-110 transition-transform cursor-pointer">
                            {user.avatar ? (
                              <AvatarImage
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <AvatarFallback
                                style={{
                                  backgroundColor: userColor,
                                  color: getContrastColor(userColor),
                                  fontSize: "0.6rem",
                                  fontWeight: "600",
                                }}
                              >
                                {getInitials(user.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="center">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: userColor }}
                            />
                            <span className="font-medium">
                              {user.name || "Usuario anónimo"}
                            </span>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Editor content con scroll interno */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Estilos mejorados */}
      <style jsx global>{`
        .collaboration-cursor__caret {
          position: relative;
          margin-left: -1px;
          margin-right: -1px;
          border-left: 1px solid;
          border-right: 1px solid;
          word-break: normal;
          pointer-events: none;
        }

        .collaboration-cursor__label {
          position: absolute;
          top: -1.4em;
          left: -1px;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          user-select: none;
          color: #fff;
          padding: 0.1rem 0.3rem;
          border-radius: 3px 3px 3px 0;
          white-space: nowrap;
          z-index: 50;
        }

        /* Editor styles mejorados */
        .ProseMirror {
          height: auto;
          color: hsl(var(--foreground));
          line-height: 1.7;
          border: 1px solid hsl(var(--border));
        }

        .ProseMirror-focused {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }

        .ProseMirror > * + * {
          margin-top: 0.75em;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding: 0 1rem;
        }

        .ProseMirror h1 {
          font-size: 2.25em;
          font-weight: 700;
          line-height: 1.2;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: hsl(var(--foreground));
        }

        .ProseMirror h2 {
          font-size: 1.875em;
          font-weight: 600;
          line-height: 1.3;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
          color: hsl(var(--foreground));
        }

        .ProseMirror h3 {
          font-size: 1.5em;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: hsl(var(--foreground));
        }

        .ProseMirror code {
          background-color: hsl(var(--muted));
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.875em;
          color: hsl(var(--foreground));
        }

        .ProseMirror pre {
          background: hsl(var(--muted));
          border: 1px solid hsl(var(--border));
          padding: 1rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          color: inherit;
          padding: 0;
          background: none;
          font-size: 0.875rem;
        }

        .ProseMirror blockquote {
          padding-left: 1rem;
          border-left: 4px solid hsl(var(--primary));
          margin: 1.5rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }

        .ProseMirror hr {
          border: none;
          border-top: 2px solid hsl(var(--border));
          margin: 3rem 0;
        }

        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
          border-radius: 8px;
        }

        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1.5rem 0;
          overflow: hidden;
          border-radius: 8px;
          border: 1px solid hsl(var(--border));
        }

        .ProseMirror td,
        .ProseMirror th {
          min-width: 1em;
          border: 1px solid hsl(var(--border));
          padding: 0.75rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }

        .ProseMirror th {
          font-weight: 600;
          background-color: hsl(var(--muted));
        }

        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: hsl(var(--primary) / 0.1);
          pointer-events: none;
        }

        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .ProseMirror a:hover {
          color: hsl(var(--primary) / 0.8);
        }

        /* Selección personalizada */
        .ProseMirror ::selection {
          background: hsl(var(--primary) / 0.2);
        }

        /* Mejoras en el highlight */
        .ProseMirror mark {
          background-color: hsl(var(--secondary));
          padding: 0.125rem 0.25rem;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
