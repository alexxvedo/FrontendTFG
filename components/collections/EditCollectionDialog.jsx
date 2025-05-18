"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Edit3, BookText, Tag, X, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ColorPicker } from "@/components/ui/color-picker";

export default function EditCollectionDialog({ collection, onUpdate }) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || "");
  const [tags, setTags] = useState(collection.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [color, setColor] = useState(collection.color || "gradient");
  const [open, setOpen] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(collection.name);
      setDescription(collection.description || "");
      setTags(collection.tags || []);
      setCurrentTag("");
      setColor(collection.color || "gradient");
    }
  }, [open, collection]);

  const handleSubmit = () => {
    onUpdate({ 
      name, 
      description,
      tags,
      color
    });
    setOpen(false);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="hover:bg-purple-500/10 dark:hover:bg-purple-500/20 text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0A0A0F]/95 border border-purple-500/20 backdrop-blur-sm shadow-lg overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-600/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />

        <DialogHeader className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
              <Edit3 className="h-5 w-5 text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Editar Colección
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Modifica los detalles de la colección
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-5 relative z-10">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4 text-blue-400" />
              Nombre
            </label>
            <div className="flex">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la colección"
                className="bg-zinc-800/80 border-zinc-700/50 focus:ring-purple-500/30 focus:border-purple-500/50 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              <BookText className="h-4 w-4 text-purple-400" />
              Descripción
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la colección"
              className="min-h-[100px] resize-none bg-zinc-800/80 border-zinc-700/50 focus:ring-purple-500/30 focus:border-purple-500/50 text-white"
            />
            <p className="text-xs text-gray-500">
              Una buena descripción ayuda a los usuarios a entender el propósito
              de esta colección.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="tags"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              <Tag className="h-4 w-4 text-green-400" />
              Etiquetas
            </label>
            <div className="flex">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Añadir etiqueta y presionar Enter"
                className="bg-zinc-800/80 border-zinc-700/50 focus:ring-purple-500/30 focus:border-purple-500/50 text-white"
              />
              <Button 
                type="button" 
                onClick={handleAddTag} 
                disabled={!currentTag.trim()}
                className="ml-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500"
              >
                Añadir
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    className={`${
                      color === 'gradient'
                        ? 'bg-gradient-to-r from-green-600/20 to-teal-600/20 text-green-600 dark:text-green-400 border-green-600/30'
                        : ''
                    } px-2 py-1 flex items-center gap-1`}
                    style={color !== 'gradient' ? { 
                      backgroundColor: `${color}20`, 
                      borderColor: `${color}40`,
                      color: color
                    } : {}}
                  >
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-300 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Las etiquetas te ayudarán a organizar y encontrar tus colecciones más fácilmente.
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              <Palette className="h-4 w-4 text-purple-400" />
              Color
            </label>
            <ColorPicker value={color} onChange={setColor} />
            <p className="text-xs text-gray-500">
              Elige un color para personalizar tu colección.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 py-6"
            >
              <Edit3 className="h-5 w-5" />
              Guardar Cambios
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
