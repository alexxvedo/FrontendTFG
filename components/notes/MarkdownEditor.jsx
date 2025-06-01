"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Image,
  SplitSquareVertical,
  Edit,
  Eye,
  Grip,
  CheckSquare,
  Table,
  AlignLeft,
  Undo,
  Redo,
  FileDown,
  FileUp,
  Minus,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MarkdownEditor = ({
  content = "",
  noteName,
  onChange,
  placeholder = "Empieza a escribir en Markdown...",
}) => {
  const [view, setView] = useState("split"); // split, editor, preview
  const [editorContent, setEditorContent] = useState(content);
  const [resizing, setResizing] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // porcentaje
  const [history, setHistory] = useState({ past: [], future: [] });
  const [currentTab, setCurrentTab] = useState("write"); // write, preview
  const [fileName, setFileName] = useState(noteName + ".md" || "documento.md");
  const [showShortcuts, setShowShortcuts] = useState(false);

  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const resizerRef = useRef(null);
  const { theme } = useTheme();

  // Sincronizar el contenido externo con el estado interno
  useEffect(() => {
    setEditorContent(content);
    console.log("Note name: ", noteName);

    setFileName(noteName + ".md");
  }, [content]);

  // Guardar cambios en el historial para deshacer/rehacer
  const saveToHistory = (newContent) => {
    setHistory((prev) => ({
      past: [...prev.past, editorContent],
      future: [],
    }));
    setEditorContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  // Deshacer
  const handleUndo = () => {
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    setHistory({
      past: newPast,
      future: [editorContent, ...history.future],
    });

    setEditorContent(previous);
    if (onChange) {
      onChange(previous);
    }
  };

  // Rehacer
  const handleRedo = () => {
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, editorContent],
      future: newFuture,
    });

    setEditorContent(next);
    if (onChange) {
      onChange(next);
    }
  };

  // Manejar cambios en el editor con soporte para indentación y continuación de listas
  const handleEditorChange = (e) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  // Manejar teclas especiales como Tab, Enter en listas, etc.
  const handleKeyDown = (e) => {
    const editor = editorRef.current;
    const { selectionStart, selectionEnd, value } = editor;

    // Obtener la línea actual
    const textBeforeCursor = value.substring(0, selectionStart);
    const textAfterCursor = value.substring(selectionStart);
    const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1;
    const currentLine = textBeforeCursor.substring(currentLineStart);

    // Atajos de teclado para formato
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b": // Negrita
          e.preventDefault();
          insertMarkdown("bold");
          return;
        case "i": // Cursiva
          e.preventDefault();
          insertMarkdown("italic");
          return;
        case "k": // Enlace
          e.preventDefault();
          insertMarkdown("link");
          return;
        case "z": // Deshacer
          if (!e.shiftKey) {
            e.preventDefault();
            handleUndo();
            return;
          }
          break;
        case "y": // Rehacer
          e.preventDefault();
          handleRedo();
          return;
        case "h": // Encabezado
          e.preventDefault();
          insertMarkdown("heading1");
          return;
        case "s": // Guardar
          e.preventDefault();
          downloadMarkdown();
          return;
      }
    }

    // Manejar Tab para indentación
    if (e.key === "Tab") {
      e.preventDefault();

      // Si hay texto seleccionado, indentar o desindentar múltiples líneas
      if (selectionStart !== selectionEnd) {
        const selectedText = value.substring(selectionStart, selectionEnd);
        const lines = selectedText.split("\n");

        if (e.shiftKey) {
          // Desindentar: eliminar 2 espacios o un tab del inicio de cada línea
          const deindentedLines = lines.map((line) => {
            if (line.startsWith("  ")) return line.substring(2);
            if (line.startsWith("\t")) return line.substring(1);
            return line;
          });
          const newText = deindentedLines.join("\n");
          const newContent =
            value.substring(0, selectionStart) +
            newText +
            value.substring(selectionEnd);
          saveToHistory(newContent);

          // Actualizar selección
          setTimeout(() => {
            editor.setSelectionRange(
              selectionStart,
              selectionStart + newText.length
            );
          }, 0);
        } else {
          // Indentar: añadir 2 espacios al inicio de cada línea
          const indentedLines = lines.map((line) => "  " + line);
          const newText = indentedLines.join("\n");
          const newContent =
            value.substring(0, selectionStart) +
            newText +
            value.substring(selectionEnd);
          saveToHistory(newContent);

          // Actualizar selección
          setTimeout(() => {
            editor.setSelectionRange(
              selectionStart,
              selectionStart + newText.length
            );
          }, 0);
        }
        return;
      }

      // Insertar 2 espacios en la posición actual del cursor
      const newContent =
        value.substring(0, selectionStart) +
        "  " +
        value.substring(selectionEnd);
      setEditorContent(newContent);
      if (onChange) {
        onChange(newContent);
      }

      // Mover el cursor después de los espacios insertados
      setTimeout(() => {
        editor.setSelectionRange(selectionStart + 2, selectionStart + 2);
      }, 0);
      return;
    }

    // Manejar Enter para continuar listas
    if (e.key === "Enter") {
      // Detectar si estamos en una lista
      const listItemRegex = /^(\s*)([*+-]|\d+\.)\s+(.*)$/;
      const checkboxRegex = /^(\s*)([*+-])\s+\[(x|X| )]\]\s+(.*)$/;
      const match = currentLine.match(listItemRegex);
      const checkboxMatch = currentLine.match(checkboxRegex);

      if (match || checkboxMatch) {
        e.preventDefault();

        let indent = "";
        let listMarker = "";
        let content = "";

        if (checkboxMatch) {
          indent = checkboxMatch[1] || "";
          listMarker = checkboxMatch[2] || "";
          content = checkboxMatch[4] || "";

          // Si la línea actual está vacía (solo tiene el checkbox), terminar la lista
          if (!content.trim()) {
            const textUpToCursor = value.substring(0, selectionStart);
            const newContent =
              textUpToCursor.substring(
                0,
                textUpToCursor.lastIndexOf(indent + listMarker)
              ) +
              textUpToCursor.substring(
                textUpToCursor.lastIndexOf(indent + listMarker) +
                  (indent + listMarker + " [] ").length
              ) +
              "\n" +
              indent +
              value.substring(selectionEnd);
            saveToHistory(newContent);

            // Colocar el cursor en la nueva línea
            const newCursorPos =
              textUpToCursor.lastIndexOf(indent + listMarker) + indent.length;
            setTimeout(() => {
              editor.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
            return;
          }

          // Continuar la lista con un nuevo checkbox
          const newContent =
            value.substring(0, selectionStart) +
            "\n" +
            indent +
            listMarker +
            " [ ] " +
            value.substring(selectionEnd);
          saveToHistory(newContent);

          // Colocar el cursor después del nuevo marcador de lista
          const newCursorPos =
            selectionStart + 1 + indent.length + listMarker.length + 5;
          setTimeout(() => {
            editor.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
          return;
        }

        if (match) {
          indent = match[1] || "";
          listMarker = match[2] || "";
          content = match[3] || "";

          // Si la línea actual está vacía, terminar la lista
          if (!content.trim()) {
            const textUpToCursor = value.substring(0, selectionStart);
            const newContent =
              textUpToCursor.substring(
                0,
                textUpToCursor.lastIndexOf(indent + listMarker)
              ) +
              textUpToCursor.substring(
                textUpToCursor.lastIndexOf(indent + listMarker) +
                  (indent + listMarker + " ").length
              ) +
              "\n" +
              indent +
              value.substring(selectionEnd);
            saveToHistory(newContent);

            // Colocar el cursor en la nueva línea
            const newCursorPos =
              textUpToCursor.lastIndexOf(indent + listMarker) + indent.length;
            setTimeout(() => {
              editor.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
            return;
          }

          // Para listas numeradas, incrementar el número
          if (/^\d+\./.test(listMarker)) {
            const num = parseInt(listMarker, 10);
            listMarker = num + 1 + ".";
          }

          // Continuar la lista
          const newContent =
            value.substring(0, selectionStart) +
            "\n" +
            indent +
            listMarker +
            " " +
            value.substring(selectionEnd);
          saveToHistory(newContent);

          // Colocar el cursor después del nuevo marcador de lista
          const newCursorPos =
            selectionStart + 1 + indent.length + listMarker.length + 1;
          setTimeout(() => {
            editor.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
          return;
        }
      }
    }
  };

  // Insertar formato de Markdown
  const insertMarkdown = (format) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const { selectionStart, selectionEnd } = editor;
    const selectedText = editor.value.substring(selectionStart, selectionEnd);
    const textBeforeCursor = editor.value.substring(0, selectionStart);
    const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1;
    const currentLine = textBeforeCursor.substring(currentLineStart);
    const lineIndent = currentLine.match(/^(\s*)/)[1] || "";

    let prefix = "";
    let suffix = "";
    let placeholder = "";
    let multiline = false;

    switch (format) {
      case "bold":
        prefix = "**";
        suffix = "**";
        placeholder = "texto en negrita";
        break;
      case "italic":
        prefix = "*";
        suffix = "*";
        placeholder = "texto en cursiva";
        break;
      case "heading1":
        prefix = "# ";
        suffix = "";
        placeholder = "Encabezado principal";
        break;
      case "heading2":
        prefix = "## ";
        suffix = "";
        placeholder = "Encabezado secundario";
        break;
      case "heading3":
        prefix = "### ";
        suffix = "";
        placeholder = "Encabezado terciario";
        break;
      case "link":
        prefix = "[";
        suffix = "](url)";
        placeholder = "enlace";
        break;
      case "image":
        prefix = "![";
        suffix = "](url)";
        placeholder = "descripción";
        break;
      case "code":
        if (selectedText.includes("\n") || selectionStart !== selectionEnd) {
          prefix = "```\n";
          suffix = "\n```";
          placeholder = "código";
          multiline = true;
        } else {
          prefix = "`";
          suffix = "`";
          placeholder = "código";
        }
        break;
      case "quote":
        if (selectedText.includes("\n")) {
          // Para múltiples líneas, añadir '> ' al inicio de cada línea
          const lines = selectedText.split("\n");
          const quotedLines = lines.map((line) => "> " + line).join("\n");
          const newContent =
            editor.value.substring(0, selectionStart) +
            quotedLines +
            editor.value.substring(selectionEnd);
          saveToHistory(newContent);

          // Seleccionar todo el texto citado
          setTimeout(() => {
            editor.setSelectionRange(
              selectionStart,
              selectionStart + quotedLines.length
            );
          }, 0);
          return;
        } else {
          prefix = "> ";
          suffix = "";
          placeholder = "cita";
        }
        break;
      case "ul":
        if (selectedText.includes("\n")) {
          // Para múltiples líneas, convertir cada línea en un elemento de lista
          const lines = selectedText.split("\n");
          const listItems = lines.map((line) => "- " + line).join("\n");
          const newContent =
            editor.value.substring(0, selectionStart) +
            listItems +
            editor.value.substring(selectionEnd);
          saveToHistory(newContent);

          // Seleccionar toda la lista
          setTimeout(() => {
            editor.setSelectionRange(
              selectionStart,
              selectionStart + listItems.length
            );
          }, 0);
          return;
        } else {
          prefix = "- ";
          suffix = "";
          placeholder = "elemento de lista";
        }
        break;
      case "ol":
        if (selectedText.includes("\n")) {
          // Para múltiples líneas, convertir cada línea en un elemento numerado
          const lines = selectedText.split("\n");
          let listItems = "";
          lines.forEach((line, index) => {
            listItems += `${index + 1}. ${line}${
              index < lines.length - 1 ? "\n" : ""
            }`;
          });
          const newContent =
            editor.value.substring(0, selectionStart) +
            listItems +
            editor.value.substring(selectionEnd);
          saveToHistory(newContent);

          // Seleccionar toda la lista
          setTimeout(() => {
            editor.setSelectionRange(
              selectionStart,
              selectionStart + listItems.length
            );
          }, 0);
          return;
        } else {
          prefix = "1. ";
          suffix = "";
          placeholder = "elemento numerado";
        }
        break;
      case "checkbox":
        prefix = "- [ ] ";
        suffix = "";
        placeholder = "tarea pendiente";
        break;
      case "table":
        prefix =
          "|  Encabezado 1  |  Encabezado 2  |  Encabezado 3  |\n| ------------- | ------------- | ------------- |\n|  Contenido 1  |  Contenido 2  |  Contenido 3  |\n";
        suffix = "";
        placeholder = "";
        multiline = true;
        break;
      case "hr":
        prefix = "\n---\n";
        suffix = "";
        placeholder = "";
        break;
      default:
        return;
    }

    let newText;
    if (selectedText) {
      if (multiline && format === "code") {
        // Para bloques de código, mantener la indentación de cada línea
        const lines = selectedText.split("\n");
        newText = prefix + selectedText + suffix;
      } else {
        newText = prefix + selectedText + suffix;
      }
    } else {
      newText = prefix + placeholder + suffix;
    }

    const newContent =
      editor.value.substring(0, selectionStart) +
      newText +
      editor.value.substring(selectionEnd);
    saveToHistory(newContent);

    // Restaurar el foco y seleccionar el texto insertado
    editor.focus();
    const newCursorPos = selectionStart + prefix.length;
    const newSelectionEnd = selectedText
      ? newCursorPos + selectedText.length
      : newCursorPos + placeholder.length;

    setTimeout(() => {
      editor.setSelectionRange(newCursorPos, newSelectionEnd);
    }, 0);
  };

  // Exportar el contenido como archivo Markdown
  const downloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([editorContent], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Importar archivo Markdown
  const importMarkdown = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Actualizar el nombre del archivo
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      saveToHistory(content);
    };
    reader.readAsText(file);
  };

  // Referencia al input de archivo oculto
  const fileInputRef = useRef(null);

  // Iniciar el redimensionamiento
  const startResize = (e) => {
    setResizing(true);
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  };

  // Redimensionar los paneles
  const resize = (e) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newPosition =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Limitar el rango entre 20% y 80%
    const clampedPosition = Math.min(Math.max(newPosition, 20), 80);
    setSplitPosition(clampedPosition);
  };

  // Detener el redimensionamiento
  const stopResize = () => {
    setResizing(false);
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  };

  // Cambiar la vista
  const changeView = (newView) => {
    setView(newView);
  };

  // Barra de herramientas para Markdown
  const toolbarItems = [
    // Grupo de encabezados
    {
      icon: <Heading1 size={16} />,
      action: () => insertMarkdown("heading1"),
      title: "Encabezado 1",
      group: "headings",
    },
    {
      icon: <Heading2 size={16} />,
      action: () => insertMarkdown("heading2"),
      title: "Encabezado 2",
      group: "headings",
    },
    {
      icon: <Heading3 size={16} />,
      action: () => insertMarkdown("heading3"),
      title: "Encabezado 3",
      group: "headings",
    },

    // Grupo de formato de texto
    {
      icon: <Bold size={16} />,
      action: () => insertMarkdown("bold"),
      title: "Negrita",
      group: "format",
    },
    {
      icon: <Italic size={16} />,
      action: () => insertMarkdown("italic"),
      title: "Cursiva",
      group: "format",
    },
    {
      icon: <Code size={16} />,
      action: () => insertMarkdown("code"),
      title: "Código",
      group: "format",
    },

    // Grupo de enlaces y media
    {
      icon: <Link size={16} />,
      action: () => insertMarkdown("link"),
      title: "Enlace",
      group: "links",
    },
    {
      icon: <Image size={16} />,
      action: () => insertMarkdown("image"),
      title: "Imagen",
      group: "links",
    },

    // Grupo de listas
    {
      icon: <List size={16} />,
      action: () => insertMarkdown("ul"),
      title: "Lista",
      group: "lists",
    },
    {
      icon: <ListOrdered size={16} />,
      action: () => insertMarkdown("ol"),
      title: "Lista numerada",
      group: "lists",
    },
    {
      icon: <CheckSquare size={16} />,
      action: () => insertMarkdown("checkbox"),
      title: "Lista de tareas",
      group: "lists",
    },

    // Grupo de elementos de bloque
    {
      icon: <Quote size={16} />,
      action: () => insertMarkdown("quote"),
      title: "Cita",
      group: "blocks",
    },
    {
      icon: <Table size={16} />,
      action: () => insertMarkdown("table"),
      title: "Tabla",
      group: "blocks",
    },
    {
      icon: <AlignLeft size={16} />,
      action: () => insertMarkdown("hr"),
      title: "Línea horizontal",
      group: "blocks",
    },
  ];

  // Agrupar los botones por categoría
  const toolbarGroups = {
    headings: {
      title: "Encabezados",
      items: toolbarItems.filter((item) => item.group === "headings"),
    },
    format: {
      title: "Formato",
      items: toolbarItems.filter((item) => item.group === "format"),
    },
    links: {
      title: "Enlaces",
      items: toolbarItems.filter((item) => item.group === "links"),
    },
    lists: {
      title: "Listas",
      items: toolbarItems.filter((item) => item.group === "lists"),
    },
    blocks: {
      title: "Bloques",
      items: toolbarItems.filter((item) => item.group === "blocks"),
    },
  };

  // Botones de utilidad
  const utilityButtons = [
    { icon: <Undo size={16} />, action: handleUndo, title: "Deshacer" },
    { icon: <Redo size={16} />, action: handleRedo, title: "Rehacer" },
    {
      icon: <FileDown size={16} />,
      action: downloadMarkdown,
      title: "Descargar Markdown",
    },
    {
      icon: <FileUp size={16} />,
      action: () => fileInputRef.current?.click(),
      title: "Importar Markdown",
    },
  ];

  // Botones de vista
  const viewButtons = [
    {
      icon: <SplitSquareVertical size={16} />,
      view: "split",
      title: "Vista dividida",
    },
    {
      icon: <Edit size={16} />,
      view: "editor",
      title: "Solo editor",
    },
    {
      icon: <Eye size={16} />,
      view: "preview",
      title: "Solo vista previa",
    },
  ];

  return (
    <div
      className="flex flex-col h-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-[#0A0A0F]"
      style={{ height: "100%", minHeight: "100%" }}
    >
      {/* Barra de herramientas */}
      <div className="bg-zinc-100 dark:bg-zinc-900/50 p-2 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-3"
                  >
                    {fileName}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Nombre del documento</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6" />

            {/* Botones de utilidad */}
            <div className="flex gap-1">
              {utilityButtons.map((item, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={item.action}
                        className="p-1.5 rounded-md transition-all duration-200 ease-in-out h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {item.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Botones de vista */}
          <div className="flex gap-1 bg-zinc-200/50 dark:bg-zinc-800/50 p-0.5 rounded-md">
            {viewButtons.map((item, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={view === item.view ? "default" : "ghost"}
                      size="sm"
                      onClick={() => changeView(item.view)}
                      className={`p-1.5 rounded-md transition-all duration-200 ease-in-out h-8 ${
                        view === item.view
                          ? "bg-white dark:bg-zinc-700 shadow-sm"
                          : "hover:bg-zinc-200 dark:hover:bg-zinc-800 bg-transparent"
                      } text-zinc-700 dark:text-zinc-300`}
                    >
                      <div className="flex items-center gap-1.5">
                        {item.icon}
                        <span className="text-xs font-medium">
                          {item.title}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Cambiar a {item.title.toLowerCase()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Barra de herramientas agrupada */}
        <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
          {Object.entries(toolbarGroups).map(([groupKey, group]) => (
            <div key={groupKey} className="flex items-center">
              {groupKey !== "headings" && (
                <Separator orientation="vertical" className="h-6 mx-1" />
              )}
              <div className="flex gap-1">
                {group.items.map((item, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={item.action}
                          className="p-1.5 rounded-md transition-all duration-200 ease-in-out h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        >
                          {item.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input oculto para importar archivos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={importMarkdown}
        accept=".md, .markdown, .txt"
        className="hidden"
      />

      {/* Contenedor principal */}
      <div
        ref={containerRef}
        className="flex-1 flex overflow-hidden relative"
        style={{
          cursor: resizing ? "col-resize" : "default",
          height: "calc(100vh - 120px)",
          minHeight: "500px",
        }}
      >
        {/* Editor de Markdown */}
        {(view === "editor" || view === "split") && (
          <div
            className="min-h-full overflow-auto border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0F]/80"
            style={{
              width: view === "split" ? `${splitPosition}%` : "100%",
              transition: resizing ? "none" : "width 0.3s ease",
            }}
          >
            <textarea
              ref={editorRef}
              value={editorContent}
              onChange={handleEditorChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm text-zinc-900 dark:text-zinc-100"
              spellCheck="false"
            />
          </div>
        )}

        {/* Divisor redimensionable */}
        {view === "split" && (
          <div
            ref={resizerRef}
            className="w-4 h-full bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 hover:from-blue-400/20 hover:to-blue-500/20 dark:hover:from-blue-600/30 dark:hover:to-blue-500/30 cursor-col-resize flex items-center justify-center z-10"
            onMouseDown={startResize}
          >
            <div className="h-16 w-1 bg-zinc-300 dark:bg-zinc-600 rounded-full mx-auto"></div>
            <div className="absolute">
              <Grip size={16} className="text-zinc-500 dark:text-zinc-400" />
            </div>
          </div>
        )}

        {/* Vista previa de Markdown */}
        {(view === "preview" || view === "split") && (
          <div
            className="h-full overflow-auto bg-zinc-50 dark:bg-[#0F0F14]"
            style={{
              width: view === "split" ? `${100 - splitPosition}%` : "100%",
              transition: resizing ? "none" : "width 0.3s ease",
            }}
          >
            <div className="p-6 max-w-none h-full">
              {editorContent ? (
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-3xl font-bold mb-4 mt-6 text-zinc-900 dark:text-white"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-2xl font-bold mb-3 mt-5 text-zinc-900 dark:text-white"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-xl font-bold mb-3 mt-4 text-zinc-900 dark:text-white"
                        {...props}
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4
                        className="text-lg font-bold mb-2 mt-4 text-zinc-900 dark:text-white"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className="mb-4 text-zinc-700 dark:text-zinc-300 leading-relaxed"
                        {...props}
                      />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc pl-6 mb-4 space-y-2"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal pl-6 mb-4 space-y-2"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li
                        className="text-zinc-700 dark:text-zinc-300"
                        {...props}
                      />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic my-4 text-zinc-600 dark:text-zinc-400"
                        {...props}
                      />
                    ),
                    code: ({ node, inline, ...props }) =>
                      inline ? (
                        <code
                          className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-pink-600 dark:text-pink-400 font-mono text-sm"
                          {...props}
                        />
                      ) : (
                        <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto mb-4">
                          <code
                            className="text-pink-600 dark:text-pink-400 font-mono text-sm"
                            {...props}
                          />
                        </pre>
                      ),
                    img: ({ node, ...props }) => (
                      <img
                        className="max-w-full h-auto rounded-lg my-4 border border-zinc-200 dark:border-zinc-700"
                        {...props}
                      />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr
                        className="my-6 border-zinc-200 dark:border-zinc-800"
                        {...props}
                      />
                    ),
                  }}
                >
                  {editorContent}
                </ReactMarkdown>
              ) : (
                <div className="text-zinc-400 dark:text-zinc-500 italic">
                  La vista previa aparecerá aquí...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
