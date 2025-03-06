import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useApi } from "@/lib/api";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { useSession } from "next-auth/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Highlighter,
  Undo,
  Redo,
  List,
  ListOrdered,
  Heading1,
  Quote,
  Table as TableIcon,
  Palette,
} from "lucide-react";

export default function FlashcardEditor({
  open,
  onOpenChange,
  collection,
  onFlashcardAdded,
}) {
  const [flashcards, setFlashcards] = useState([]);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();
  const { addFlashcard, updateFlashcard, removeFlashcard } =
    useCollectionStore();
  const { data: session } = useSession();
  const user = session?.user;

  const editorConfig = {
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlock.configure({
        languageClassPrefix: 'language-',
        HTMLAttributes: {
          class: 'rounded-md bg-zinc-100 dark:bg-zinc-800 p-4',
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['paragraph', 'heading'],
      }),
      Placeholder.configure({
        placeholder: 'Escribe aquí...',
      }),
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 [&_ol]:ml-4 [&_table]:border [&_td]:border [&_th]:border [&_td]:p-2 [&_th]:p-2',
      },
    },
  };

  const questionEditor = useEditor({
    ...editorConfig,
    content: "",
  });

  const answerEditor = useEditor({
    ...editorConfig,
    content: "",
  });

  useEffect(() => {
    if (open && collection) {
      fetchFlashcards();
    }
  }, [open, collection]);

  useEffect(() => {
    if (!open) {
      questionEditor?.commands.clearContent();
      answerEditor?.commands.clearContent();
      setEditingFlashcard(null);
      setIsEditing(false);
    }
  }, [open]);

  const fetchFlashcards = async () => {
    if (!collection?.id) return;

    try {
      const response = await api.flashcards.listByCollection(collection.id);
      setFlashcards(response.data || []);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("Error al cargar las flashcards");
    }
  };

  const saveFlashcard = async () => {
    const questionContent = questionEditor?.getHTML();
    const answerContent = answerEditor?.getHTML();

    if (!questionContent?.trim() || !answerContent?.trim()) {
      toast.error("Por favor, completa tanto la pregunta como la respuesta.");
      return;
    }

    try {
      setIsLoading(true);
      const newFlashcard = {
        question: questionContent,
        answer: answerContent,
        status: "SIN_HACER",
        collectionId: collection.id,
      };

      let savedFlashcard;
      if (isEditing && editingFlashcard) {
        const response = await api.flashcards.update(
          collection.id,
          editingFlashcard.id,
          newFlashcard,
          user.email
        );
        savedFlashcard = response.data;
        updateFlashcard(savedFlashcard);
      } else {
        const response = await api.flashcards.create(
          collection.id,
          newFlashcard,
          user.email
        );
        savedFlashcard = response.data;
        addFlashcard(savedFlashcard);
      }

      questionEditor?.commands.clearContent();
      answerEditor?.commands.clearContent();
      setEditingFlashcard(null);
      setIsEditing(false);

      if (onFlashcardAdded) {
        onFlashcardAdded(savedFlashcard);
      }

      toast.success(
        isEditing
          ? "Flashcard actualizada correctamente"
          : "Flashcard creada correctamente"
      );

      await fetchFlashcards();
    } catch (error) {
      console.error("Error saving flashcard:", error);
      toast.error(
        isEditing
          ? "Error al actualizar la flashcard"
          : "Error al crear la flashcard"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (flashcard) => {
    setEditingFlashcard(flashcard);
    questionEditor?.commands.setContent(flashcard.question);
    answerEditor?.commands.setContent(flashcard.answer);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingFlashcard(null);
    questionEditor?.commands.clearContent();
    answerEditor?.commands.clearContent();
    setIsEditing(false);
  };

  const MenuBar = ({ editor }) => {
    if (!editor) {
      return null;
    }

    const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
          setShowColorPicker(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleColorSelect = (color) => {
      editor.chain().focus().setColor(color).run();
      setShowColorPicker(false);
    };

    return (
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-t-lg">
        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="icon"
          title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Code and Highlighting */}
        <Button
          variant="ghost"
          size="icon"
          title="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="icon"
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="icon"
          title="Align Left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Align Center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Align Right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Table */}
        <Button
          variant="ghost"
          size="icon"
          title="Insert Table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Text Color */}
        <div className="relative inline-block" ref={colorPickerRef}>
          <Button
            variant="ghost"
            size="icon"
            title="Text Color"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={showColorPicker ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
          >
            <Palette className="h-4 w-4" />
          </Button>
          {showColorPicker && (
            <div className="absolute flex flex-wrap gap-1 bg-white dark:bg-zinc-800 p-2 rounded-md shadow-lg z-50 top-full left-0 mt-1 min-w-[150px]">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="icon"
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[900px] md:max-w-[1000px] bg-gradient-to-br from-white to-zinc-50/95 dark:from-zinc-900 dark:to-zinc-950/95 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-indigo-500/10"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            {editingFlashcard ? "Editar Flashcard" : "Crear Nueva Flashcard"}
          </DialogTitle>
          <p className="text-zinc-600 dark:text-zinc-400">
            {editingFlashcard
              ? "Modifica el contenido de tu flashcard"
              : "Escribe el contenido de tu flashcard. ¡Sé creativo y preciso!"}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-[300px,1fr] gap-6">
          {/* Lista de Flashcards */}
          <div className="border-r border-zinc-200 dark:border-zinc-800 pr-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Flashcards
              </h3>
              {editingFlashcard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                  className="text-xs"
                >
                  + Nueva
                </Button>
              )}
            </div>
            <ScrollArea className="h-[600px] pr-4 -mr-4">
              <div className="space-y-3 pr-4">
                {flashcards.map((flashcard) => (
                  <motion.div
                    key={flashcard.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg overflow-hidden"
                  >
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        editingFlashcard?.id === flashcard.id
                          ? "ring-2 ring-emerald-500 shadow-lg"
                          : "hover:scale-[1.02]"
                      }`}
                      onClick={() => startEditing(flashcard)}
                    >
                      <div
                        className="font-medium text-sm mb-2 line-clamp-2 text-zinc-900 dark:text-zinc-100 prose dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: flashcard.question }}
                      />
                      <div
                        className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 prose dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: flashcard.answer }}
                      />
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Pregunta
              </label>
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur transition duration-1000 group-hover:opacity-30 group-hover:duration-200"></div>
                <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card overflow-hidden">
                  <MenuBar editor={questionEditor} />
                  <EditorContent editor={questionEditor} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Respuesta
              </label>
              <div className="group relative">
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur transition duration-1000 group-hover:opacity-30 group-hover:duration-200"></div>
                <div className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card overflow-hidden">
                  <MenuBar editor={answerEditor} />
                  <EditorContent editor={answerEditor} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={saveFlashcard}
                disabled={
                  !questionEditor?.getText()?.trim() ||
                  !answerEditor?.getText()?.trim() ||
                  isLoading
                }
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/35 hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {editingFlashcard ? "Actualizar" : "Guardar"} Flashcard
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-500"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            Tip: Usa el editor enriquecido para crear flashcards más atractivas
            y estructuradas
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
