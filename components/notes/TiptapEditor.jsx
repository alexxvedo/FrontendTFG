import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
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

const lowlight = createLowlight();

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
          className={`
            p-2 rounded-lg transition-all duration-200 ease-in-out
            ${
              item.isActive()
                ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }
          `}
          title={item.title}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
};

const TiptapEditor = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="tiptap-wrapper border dark:border-gray-700 rounded-lg overflow-hidden h-full">
      <MenuBar editor={editor} />
      <div className="p-4 bg-white dark:bg-gray-900 overflow-y-auto max-h-full">
        <EditorContent
          editor={editor}
          className="tiptap-content min-h-[200px] h-full focus:outline-none"
        />
      </div>
    </div>
  );
};

export default TiptapEditor;
