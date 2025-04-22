"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DeleteCollectionDialog({ collection, onDelete }) {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-white/95 dark:bg-[#0A0A0F]/95 backdrop-blur-sm border border-gray-200/20 dark:border-gray-800/40 shadow-lg overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-red-600/5 dark:bg-red-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-orange-600/5 dark:bg-orange-900/10 rounded-full blur-3xl" />
        </div>
        
        <DialogHeader className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-full bg-red-100/80 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Eliminar Colección
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 dark:text-gray-400 mt-2">
            ¿Estás seguro de que quieres eliminar esta colección?
            <div className="mt-3 mb-2 px-3 py-2 bg-gray-100/70 dark:bg-gray-800/50 rounded border-l-2 border-blue-400 dark:border-blue-500 text-center">
              <span className="text-gray-900 dark:text-white font-medium">{collection.name}</span>
            </div>
            <p className="mt-2 text-red-500 dark:text-red-400">Esta acción no se puede deshacer.</p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative z-10 my-2 p-4 bg-red-50/50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-900/20">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Advertencia</h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                <p>Al eliminar esta colección:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Se eliminarán todos los datos asociados</li>
                  <li>Los usuarios perderán acceso inmediatamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="relative z-10 gap-2 sm:gap-0 mt-2">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
