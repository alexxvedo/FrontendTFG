import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";

const NotePreview = ({ content }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-h-[300px] object-contain",
        },
      }),
    ],
    editable: false,
    content: content,
  });

  useEffect(() => {
    if (editor && content) {
      try {
        const parsedContent =
          typeof content === "string" ? JSON.parse(content) : content;
        editor.commands.setContent(parsedContent);
      } catch (error) {
        console.error("Error parsing content:", error);
        editor.commands.setContent({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Error al cargar el contenido" }],
            },
          ],
        });
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="prose prose-sm prose-invert max-w-none [&_.ProseMirror]:!p-0 [&_.ProseMirror]:!pt-0">
      <EditorContent editor={editor} />
    </div>
  );
};

export default NotePreview;
