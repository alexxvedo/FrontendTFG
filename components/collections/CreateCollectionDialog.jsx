// CrearCollectionDialog.js
"use client";
import { useState } from "react";
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

export default function CreateCollectionDialog({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onCreate({
      name: name.trim(),
      description: description.trim(),
    });
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/20 dark:border-gray-700/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
            Nueva Colección
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-gray-400">
            Introduce los detalles de la nueva colección
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground dark:text-white">
              Nombre
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la colección"
              className="col-span-3 bg-background/50 dark:bg-gray-800/50 border-gray-200/20 dark:border-gray-700/30 focus:border-purple-500 dark:focus:border-pink-500 focus:ring-purple-500 dark:focus:ring-pink-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground dark:text-white">
              Descripción (opcional)
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la colección"
              className="col-span-3 bg-background/50 dark:bg-gray-800/50 border-gray-200/20 dark:border-gray-700/30 focus:border-purple-500 dark:focus:border-pink-500 focus:ring-purple-500 dark:focus:ring-pink-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-200/20 dark:border-gray-700/30 hover:bg-purple-500/5 dark:hover:bg-purple-500/10"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:opacity-90 transition-all"
          >
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
