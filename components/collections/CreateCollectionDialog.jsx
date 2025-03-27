"use client";
import { useState } from "react";
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

const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function CreateCollectionDialog({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEmojiPicker2, setShowEmojiPicker2] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() });
    setName("");
    setDescription("");
    setShowEmojiPicker(false);
    onClose();
  };

  const { theme } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/20 dark:border-gray-700/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Nueva Colección
          </DialogTitle>
          <DialogDescription>
            Introduce los detalles de la nueva colección
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre
            </label>
            <div className="flex items-center">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la colección"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-xl px-2 border-y-2 border-r-2"
                aria-label="Agregar emoji"
              >
                😊
              </button>
            </div>
            {showEmojiPicker && (
              <div className="flex items-start justify-end ">
                <div className="absolute z-50 ">
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
            <label htmlFor="description" className="text-sm font-medium">
              Descripción (opcional)
            </label>
            <div className="flex items-center">
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la colección"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker2(!showEmojiPicker2)}
                className="text-xl px-2 border-y-2 border-r-2"
                aria-label="Agregar emoji"
              >
                😊
              </button>
            </div>
            {showEmojiPicker2 && (
              <div className="flex items-start justify-end ">
                <div className="absolute z-50 ">
                  <Picker
                    onEmojiClick={(emojiData) => {
                      setDescription((prev) => prev + emojiData.emoji);
                      setShowEmojiPicker2(false);
                    }}
                    disableAutoFocus
                    native
                    theme={theme === "dark" ? "dark" : "light"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
