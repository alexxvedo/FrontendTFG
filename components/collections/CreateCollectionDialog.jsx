"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { FolderPlus, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function CreateCollectionDialog({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { theme } = useTheme();

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setShowEmojiPicker(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-[#0A0A0F]/95 backdrop-blur-sm border border-gray-200/20 dark:border-gray-800/40 shadow-lg overflow-visible">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-600/5 dark:bg-blue-900/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-600/5 dark:bg-purple-900/20 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <DialogHeader className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-full bg-blue-100/80 dark:bg-blue-900/20">
              <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Nueva Colección
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Introduce los detalles de la nueva colección
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-5 relative z-10">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <span className="inline-block w-1 h-4 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
              Nombre
            </label>
            <div className="flex">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la colección"
                className="rounded-r-none bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
              />
              <Button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-l-none border border-l-0 border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label="Agregar emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            {showEmojiPicker && (
              <div className="relative z-[99999]">
                <div className="absolute right-0 mt-1 shadow-lg rounded-lg overflow-hidden">
                  <Picker
                    onEmojiClick={(emojiData) => {
                      setName((prev) => prev + emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                    disableAutoFocus
                    native
                    theme={theme === "dark" ? "dark" : "light"}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <span className="inline-block w-1 h-4 bg-purple-500 dark:bg-purple-400 rounded-full"></span>
              Descripción{" "}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (opcional)
              </span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la colección"
              className="min-h-[100px] resize-none bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Una buena descripción ayuda a los usuarios a entender el
              propósito de esta colección.
            </p>
          </div>
        </div>

        <DialogFooter className="relative z-[5] gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white hover:opacity-90 transition-all"
            >
              Crear Colección
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
