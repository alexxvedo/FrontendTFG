"use client";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
import {
  FaBold,
  FaItalic,
  FaUnderline as FaUnderlineIcon,
  FaStrikethrough,
  FaHighlighter,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaCode,
  FaHeading,
  FaImage,
  FaLink,
  FaTable,
  FaRulerHorizontal,
  FaPalette,
  FaFont,
  FaUndo,
  FaRedo,
  FaHeading as FaH1,
  FaHeading as FaH2,
  FaHeading as FaH3,
} from "react-icons/fa";
import {
  MdFormatColorText,
  MdFormatSize,
  MdOutlineInsertPageBreak,
  MdOutlineTableChart,
  MdCheck,
  MdClear,
  MdAdd,
  MdDelete,
  MdOutlineColorLens,
} from "react-icons/md";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const cursorPluginKey = new PluginKey("cursor");

const CursorExtension = Extension.create({
  name: "cursor",
  addOptions() {
    return {
      cursors: new Map(),
      onCursorUpdate: () => {},
    };
  },
  onCreate() {
    let debounceTimeout;
    const updateCursorPosition = (editor) => {
      const { from, to } = editor.state.selection;
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        this.options.onCursorUpdate({ from, to });
      }, 50);
    };

    this.editor.on("selectionUpdate", ({ editor }) => {
      updateCursorPosition(editor);
    });

    this.editor.on("focus", ({ editor }) => {
      updateCursorPosition(editor);
    });
  },
  addProseMirrorPlugins() {
    const { cursors } = this.options;

    return [
      new Plugin({
        key: cursorPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, old) {
            const decorations = [];

            cursors.forEach(({ userData, cursor }, userId) => {
              if (cursor && userData) {
                const hue =
                  Math.abs(
                    userData.email
                      .split("")
                      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  ) % 360;
                const cursorColor = `hsl(${hue}, 70%, 50%)`;

                try {
                  // Primero añadir la selección si existe
                  if (cursor.from !== cursor.to) {
                    decorations.push(
                      Decoration.inline(cursor.from, cursor.to, {
                        class: "user-selection",
                        style: `background-color: hsla(${hue}, 85%, 65%, 0.5)`,
                      })
                    );
                  }

                  // Luego añadir el cursor en la posición final de la selección
                  const cursorPos = cursor.to;
                  if (cursorPos >= 0 && cursorPos <= tr.doc.content.size) {
                    // Crear un contenedor para el cursor
                    const container = document.createElement("span");
                    container.className = "cursor-container";
                    container.style.position = "relative";
                    container.style.display = "inline-block";
                    container.style.width = "0";
                    container.style.height = "0";

                    // Crear un cursor mucho más visible
                    const cursorElement = document.createElement("div");

                    // Aplicar estilos para un cursor muy visible
                    cursorElement.style.position = "absolute";
                    cursorElement.style.width = "2px"; // Cursor muy grueso
                    cursorElement.style.height = "1em";
                    cursorElement.style.backgroundColor = cursorColor;
                    cursorElement.style.left = "-1px";
                    cursorElement.style.top = "-0.9em";
                    cursorElement.style.zIndex = "1000";
                    cursorElement.style.opacity = "0.9";
                    cursorElement.style.animation = "blink 1s infinite";
                    cursorElement.style.border = "none";
                    cursorElement.style.borderRadius = "1px";

                    // Añadir un brillo para hacerlo más visible
                    cursorElement.style.boxShadow = `0 0 3px ${cursorColor}, 0 0 5px ${cursorColor}`;

                    container.appendChild(cursorElement);

                    decorations.push(
                      Decoration.widget(cursorPos, () => container, {
                        key: `cursor-${userId}`,
                        side: 1,
                      })
                    );
                  }
                } catch (error) {
                  console.error("Error creating cursor decoration:", error);
                }
              }
            });

            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tableSize, setTableSize] = useState({ rows: 3, cols: 3 });
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const menuGroups = [
    {
      title: "Texto",
      items: [
        {
          icon: <FaH1 className="text-sm" />,
          title: "Título 1",
          action: () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => editor.isActive("heading", { level: 1 }),
        },
        {
          icon: <FaH2 className="text-xs" />,
          title: "Título 2",
          action: () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => editor.isActive("heading", { level: 2 }),
        },
        {
          icon: (
            <FaH3 className="text-xs" style={{ transform: "scale(0.9)" }} />
          ),
          title: "Título 3",
          action: () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: () => editor.isActive("heading", { level: 3 }),
        },
        {
          icon: <FaBold />,
          title: "Negrita",
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: () => editor.isActive("bold"),
        },
        {
          icon: <FaItalic />,
          title: "Cursiva",
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: () => editor.isActive("italic"),
        },
        {
          icon: <FaUnderlineIcon />,
          title: "Subrayado",
          action: () => editor.chain().focus().toggleUnderline().run(),
          isActive: () => editor.isActive("underline"),
        },
        {
          icon: <FaStrikethrough />,
          title: "Tachado",
          action: () => editor.chain().focus().toggleStrike().run(),
          isActive: () => editor.isActive("strike"),
        },
        {
          type: "color-picker",
          icon: <MdFormatColorText className="text-lg" />,
          title: "Color de texto",
          action: (color) => editor.chain().focus().setColor(color).run(),
          isActive: () => editor.isActive("textStyle"),
        },
        {
          icon: <FaHighlighter />,
          title: "Resaltar",
          action: () => editor.chain().focus().toggleHighlight().run(),
          isActive: () => editor.isActive("highlight"),
        },
      ],
    },
    {
      title: "Párrafo",
      items: [
        {
          icon: <FaAlignLeft />,
          title: "Alinear a la izquierda",
          action: () => editor.chain().focus().setTextAlign("left").run(),
          isActive: () => editor.isActive({ textAlign: "left" }),
        },
        {
          icon: <FaAlignCenter />,
          title: "Centrar",
          action: () => editor.chain().focus().setTextAlign("center").run(),
          isActive: () => editor.isActive({ textAlign: "center" }),
        },
        {
          icon: <FaAlignRight />,
          title: "Alinear a la derecha",
          action: () => editor.chain().focus().setTextAlign("right").run(),
          isActive: () => editor.isActive({ textAlign: "right" }),
        },
        {
          icon: <FaListUl />,
          title: "Lista con viñetas",
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: () => editor.isActive("bulletList"),
        },
        {
          icon: <FaListOl />,
          title: "Lista numerada",
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: () => editor.isActive("orderedList"),
        },
        {
          icon: <FaQuoteRight />,
          title: "Cita",
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: () => editor.isActive("blockquote"),
        },
        {
          icon: <FaRulerHorizontal />,
          title: "Línea horizontal",
          action: () => editor.chain().focus().setHorizontalRule().run(),
        },
      ],
    },
    {
      title: "Insertar",
      items: [
        {
          type: "image",
          icon: <FaImage />,
          title: "Insertar imagen",
        },
        {
          type: "link",
          icon: <FaLink />,
          title: "Insertar enlace",
        },
        {
          type: "table",
          icon: <FaTable />,
          title: "Insertar tabla",
          action: () =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: tableSize.rows, cols: tableSize.cols, withHeaderRow: true })
              .run(),
        },
        {
          icon: <FaCode />,
          title: "Bloque de código",
          action: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => editor.isActive("codeBlock"),
        },
      ],
    },
    {
      title: "Historial",
      items: [
        {
          icon: <FaUndo />,
          title: "Deshacer",
          action: () => editor.chain().focus().undo().run(),
          disabled: () => !editor.can().undo(),
        },
        {
          icon: <FaRedo />,
          title: "Rehacer",
          action: () => editor.chain().focus().redo().run(),
          disabled: () => !editor.can().redo(),
        },
      ],
    },
  ];

  return (
    <div className="tiptap-toolbar flex flex-wrap gap-1 p-2 bg-card border-b border-border rounded-t-lg backdrop-blur-sm">
      {menuGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center">
          {groupIndex > 0 && (
            <Separator
              orientation="vertical"
              className="mx-1 h-8 bg-border"
            />
          )}
          <div className="flex flex-wrap gap-1">
            {group.items.map((item, index) => {
              if (item.type === "color-picker") {
                return (
                  <Popover key={index}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`p-2 rounded-lg transition-all duration-200 ease-in-out h-9 w-9
                          ${
                            item.isActive()
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        title={item.title}
                      >
                        {item.icon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 bg-card border-border">
                      <div className="grid grid-cols-8 gap-1">
                        {[
                          "#ff0000",
                          "#ff7700",
                          "#ffdd00",
                          "#00ff00",
                          "#0000ff",
                          "#8a2be2",
                          "#ff00ff",
                          "#ffffff",
                          "#ff5555",
                          "#ff9955",
                          "#ffee55",
                          "#55ff55",
                          "#5555ff",
                          "#9955ff",
                          "#ff55ff",
                          "#cccccc",
                          "#aa0000",
                          "#aa5500",
                          "#aaaa00",
                          "#00aa00",
                          "#0000aa",
                          "#5500aa",
                          "#aa00aa",
                          "#555555",
                          "#550000",
                          "#553300",
                          "#555500",
                          "#005500",
                          "#000055",
                          "#330055",
                          "#550055",
                          "#000000",
                        ].map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded-md border border-border hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => item.action(color)}
                            title={color}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              if (item.type === "image") {
                return (
                  <Popover key={index}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-2 rounded-lg transition-all duration-200 ease-in-out h-9 w-9 hover:bg-muted text-muted-foreground"
                        title={item.title}
                      >
                        {item.icon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 bg-card border-border">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Insertar imagen
                        </h3>
                        <div className="space-y-2">
                          <Label
                            htmlFor="image-url"
                            className="text-xs text-muted-foreground"
                          >
                            URL de la imagen
                          </Label>
                          <Input
                            id="image-url"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="h-8 bg-muted border-border text-muted-foreground"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setImageUrl("")}
                            className="h-8 text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={addImage}
                            disabled={!imageUrl}
                            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            Insertar
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              if (item.type === "link") {
                return (
                  <Popover key={index}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`p-2 rounded-lg transition-all duration-200 ease-in-out h-9 w-9
                          ${
                            editor.isActive("link")
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        title={item.title}
                      >
                        {item.icon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 bg-card border-border">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {editor.isActive("link")
                            ? "Editar enlace"
                            : "Insertar enlace"}
                        </h3>
                        <div className="space-y-2">
                          <Label
                            htmlFor="link-url"
                            className="text-xs text-muted-foreground"
                          >
                            URL del enlace
                          </Label>
                          <Input
                            id="link-url"
                            placeholder="https://ejemplo.com"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="h-8 bg-muted border-border text-muted-foreground"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          {editor.isActive("link") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                editor.chain().focus().unsetLink().run()
                              }
                              className="h-8 bg-red-600 hover:bg-red-700 text-white"
                            >
                              Eliminar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLinkUrl("")}
                            className="h-8 text-muted-foreground hover:text-muted-foreground hover:bg-muted"
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={setLink}
                            disabled={!linkUrl && !editor.isActive("link")}
                            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {editor.isActive("link")
                              ? "Actualizar"
                              : "Insertar"}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              }

              if (item.type === "table") {
                return (
                  <Popover key={index}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`p-2 rounded-lg transition-all duration-200 ease-in-out h-9 w-9
                          ${
                            editor.isActive("table")
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        title={item.title}
                      >
                        {item.icon}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-card border-border">
                      {editor.isActive("table") ? (
                        <div className="grid grid-cols-2 gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              editor.chain().focus().addColumnBefore().run()
                            }
                            className="h-8 bg-muted hover:bg-muted/90 text-muted-foreground text-xs"
                          >
                            Añadir columna antes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              editor.chain().focus().addColumnAfter().run()
                            }
                            className="h-8 bg-muted hover:bg-muted/90 text-muted-foreground text-xs"
                          >
                            Añadir columna después
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              editor.chain().focus().deleteColumn().run()
                            }
                            className="h-8 bg-muted hover:bg-muted/90 text-muted-foreground text-xs"
                          >
                            Eliminar columna
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              editor.chain().focus().addRowBefore().run()
                            }
                            className="h-8 bg-muted hover:bg-muted/90 text-muted-foreground text-xs"
                          >
                            Añadir fila antes
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              editor.chain().focus().addRowAfter().run()
                            }
                            className="h-8 bg-muted hover:bg-muted/90 text-muted-foreground text-xs"
                          >
                            Añadir fila después
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              editor.chain().focus().deleteRow().run()
                            }
                            className="h-8 bg-muted hover:bg-muted/90 text-muted-foreground text-xs"
                          >
                            Eliminar fila
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              editor.chain().focus().deleteTable().run()
                            }
                            className="h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs col-span-2"
                          >
                            Eliminar tabla
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Selecciona el tamaño de la tabla
                          </h3>
                          <div 
                            className="table-grid-selector"
                            onMouseLeave={() => setHoveredCell({ row: 0, col: 0 })}
                          >
                            {Array.from({ length: 10 }, (_, rowIndex) => (
                              Array.from({ length: 10 }, (_, colIndex) => (
                                <div
                                  key={`${rowIndex}-${colIndex}`}
                                  className={`table-grid-cell ${
                                    rowIndex <= hoveredCell.row && colIndex <= hoveredCell.col
                                      ? "active"
                                      : ""
                                  }`}
                                  onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                                  onClick={() => {
                                    const rows = rowIndex + 1;
                                    const cols = colIndex + 1;
                                    setTableSize({ rows, cols });
                                    editor
                                      .chain()
                                      .focus()
                                      .insertTable({ rows, cols, withHeaderRow: true })
                                      .run();
                                  }}
                                />
                              ))
                            )).flat()}
                          </div>
                          <div className="table-grid-dimensions">
                            {hoveredCell.row > 0 || hoveredCell.col > 0
                              ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1}`
                              : `${tableSize.rows} × ${tableSize.cols}`}
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  onClick={item.action}
                  disabled={item.disabled ? item.disabled() : false}
                  className={`p-2 rounded-lg transition-all duration-200 ease-in-out h-9 w-9
                    ${
                      item.isActive && item.isActive()
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }
                    ${
                      item.disabled && item.disabled()
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                  title={item.title}
                >
                  {item.icon}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const TiptapEditor = ({
  content,
  onChange,
  onCursorUpdate,
  cursors,
  placeholder = "Empieza a escribir...",
}) => {
  const { data: session } = useSession();

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
                "bg-gray-900 rounded-md p-4 font-mono text-sm my-4 overflow-x-auto",
            },
          },
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight.configure({
          multicolor: true,
        }),
        Image,
        Link.configure({
          openOnClick: true,
          HTMLAttributes: {
            class:
              "text-white hover:text-gray-300 underline decoration-gray-400/30 underline-offset-2 transition-colors",
          },
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: "border-collapse table-auto w-full",
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
              "border-b-2 border-border bg-card/50 font-bold text-left p-2",
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: "border border-border p-2",
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
            class: "border-t border-border my-6",
          },
        }),
        CursorExtension.configure({
          cursors,
          onCursorUpdate,
        }),
      ],
      content,
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        onChange(json);
      },
      editorProps: {
        attributes: {
          class:
            "prose prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
        },
      },
    },
    [cursors]
  );

  // Log cursor updates for debugging
  useEffect(() => {
    if (cursors.size > 0) {
      console.log(
        "Current cursors:",
        Array.from(cursors.entries()).map(([id, data]) => ({
          id,
          name: data.userData?.name,
          email: data.userData?.email,
          position: data.cursor
            ? `${data.cursor.from}-${data.cursor.to}`
            : "unknown",
        }))
      );
    }
  }, [cursors]);

  // Update editor content when the content prop changes
  useEffect(() => {
    if (editor && content) {
      // Only update if the content is different to avoid infinite loops
      const currentContent = editor.getJSON();
      const stringifiedCurrent = JSON.stringify(currentContent);
      const stringifiedNew = JSON.stringify(content);

      if (stringifiedCurrent !== stringifiedNew) {
        console.log("Updating editor content:", content);
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative min-h-[500px] w-full max-w-screen mx-auto px-4">
      {/* Bubble menu that appears when text is selected */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 150,
          placement: "top",
          theme: "dark",
        }}
        className="bg-card rounded-lg shadow-xl border border-border flex p-1 backdrop-blur-sm"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-1 ${
            editor.isActive("bold")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          }`}
        >
          <FaBold size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-1 ${
            editor.isActive("italic")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          }`}
        >
          <FaItalic size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 p-1 ${
            editor.isActive("underline")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          }`}
        >
          <FaUnderlineIcon size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`h-8 w-8 p-1 ${
            editor.isActive("highlight")
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          }`}
        >
          <FaHighlighter size={14} />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6 bg-border" />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 p-1 ${
                editor.isActive("link")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <FaLink size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 bg-card border-border">
            <div className="space-y-2">
              <Label
                htmlFor="bubble-link-url"
                className="text-xs text-muted-foreground"
              >
                URL del enlace
              </Label>
              <div className="flex gap-2">
                <Input
                  id="bubble-link-url"
                  placeholder="https://ejemplo.com"
                  className="h-8 bg-muted border-border text-muted-foreground"
                  defaultValue={
                    editor.isActive("link")
                      ? editor.getAttributes("link").href
                      : ""
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const url = e.target.value;
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                      }
                      e.target
                        .closest("[data-radix-popper-content-wrapper]")
                        .querySelector('button[aria-label="Close"]')
                        .click();
                    }
                  }}
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const url =
                      document.getElementById("bubble-link-url").value;
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <MdCheck size={16} />
                </Button>
              </div>
              {editor.isActive("link") && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  className="h-8 bg-red-600 hover:bg-red-700 text-white w-full mt-2"
                >
                  Eliminar enlace
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </BubbleMenu>

      <div className="border border-border rounded-lg min-h-[500px] min-w-full h-[calc(100vh-8rem)] bg-card/50 backdrop-blur-sm shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border z-10 backdrop-blur-sm">
          <MenuBar editor={editor} />
        </div>
        <div className="relative overflow-y-auto h-[calc(100%-3rem)]">
          <EditorContent editor={editor} className="h-full" />
          <div className="absolute top-2 right-2 flex gap-1">
            {Array.from(cursors.entries()).map(([userId, { userData }]) => {
              if (userData?.email === session?.user?.email) return null;
              const hue =
                Math.abs(
                  userData?.email
                    ?.split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                ) % 360;
              return (
                <Tooltip key={userId} content={userData.name}>
                  <Avatar className="w-6 h-6 border border-border shadow-md">
                    <AvatarImage src={userData.image} />
                    <AvatarFallback
                      className="text-white text-xs"
                      style={{ backgroundColor: `hsl(${hue}, 70%, 40%)` }}
                    >
                      {userData.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
