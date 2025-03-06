import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApi } from '@/lib/api';
import { toast } from 'sonner';
import TiptapEditor from './TiptapEditor';

export default function EditNote({ note, isOpen, onClose, onNoteUpdated }) {
  const api = useApi();
  const [noteName, setNoteName] = useState(note?.noteName || '');
  const [content, setContent] = useState(note?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteName.trim() || !content.trim()) {
      toast.error('Campos requeridos', {
        description: 'El título y el contenido son obligatorios.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedNote = await api.notes.update(note.id, {
        noteName,
        content,
      });
      onNoteUpdated(updatedNote);
      onClose();
      toast.success('Nota actualizada', {
        description: 'La nota se ha actualizado correctamente.',
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Error al actualizar', {
        description: 'No se pudo actualizar la nota. Inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[90vh] flex flex-col p-0 gap-0 bg-zinc-50 dark:bg-zinc-900">
        <DialogHeader className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Editar Nota
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
            <Input
              placeholder="Título de la nota"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              className="w-full text-lg font-medium border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden bg-zinc-50 dark:bg-zinc-900 px-6">
            <div className="h-full py-4">
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Escribe el contenido de tu nota aquí..."
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
              <span>Última edición: {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose}
                className="bg-transparent border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
