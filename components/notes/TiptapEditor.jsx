"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "react-icons/fa";

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
                    const cursorElement = document.createElement("span");
                    cursorElement.className = "cursor-marker";
                    cursorElement.style.borderColor = cursorColor;

                    // Crear un contenedor para mantener el cursor y el tooltip juntos
                    const container = document.createElement("span");
                    container.className = "cursor-container";
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

  const menuItems = [
    {
      icon: <FaHeading />,
      title: "Toggle Heading",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <FaBold />,
      title: "Toggle Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: <FaItalic />,
      title: "Toggle Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: <FaUnderlineIcon />,
      title: "Toggle Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline"),
    },
    {
      icon: <FaStrikethrough />,
      title: "Toggle Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      icon: <FaHighlighter />,
      title: "Toggle Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive("highlight"),
    },
    {
      icon: <FaListUl />,
      title: "Toggle Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: <FaListOl />,
      title: "Toggle Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: <FaQuoteRight />,
      title: "Toggle Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    {
      icon: <FaCode />,
      title: "Toggle Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive("codeBlock"),
    },
    {
      icon: <FaAlignLeft />,
      title: "Align Left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: () => editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <FaAlignCenter />,
      title: "Align Center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: () => editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <FaAlignRight />,
      title: "Align Right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: () => editor.isActive({ textAlign: "right" }),
    },
  ];

  return (
    <div className="tiptap-toolbar flex flex-wrap gap-1 p-2 bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          className={`p-2 rounded-lg transition-all duration-200 ease-in-out"
            ${
              item.isActive()
                ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          title={item.title}
        >
          {item.icon}
        </button>
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
        StarterKit,
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
            "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
        },
      },
    },
    [cursors]
  ); // Añadimos cursors como dependencia para que el editor se actualice

  if (!editor) {
    return null;
  }

  return (
    <div className="relative min-h-[500px] w-full max-w-screen mx-auto px-4">
      <style jsx global>{`
        .cursor-marker {
          position: absolute;
          width: 2px;
          height: 1.2em;
          animation: blink 1s infinite;
          pointer-events: none;
        }

        .user-selection {
          pointer-events: none;
        }

        .cursor-tooltip {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 50%;
          white-space: nowrap;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          color: white;
          z-index: 50;
          pointer-events: none;
          opacity: 1;
          visibility: visible;
          transition: opacity 0.2s ease-in-out;
          background-color: var(--cursor-color);
        }

        .cursor-container {
          position: relative;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <div className="border rounded-lg min-h-[500px] min-w-full h-[calc(100vh-8rem)]">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b z-10">
          <MenuBar editor={editor} />
        </div>
        <div className="relative p-4 overflow-y-auto h-[calc(100%-3rem)]">
          <EditorContent editor={editor} />
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
                <div
                  key={userId}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: `hsl(${hue}, 70%, 40%)` }}
                  title={userData.name}
                >
                  {userData.name[0]}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
