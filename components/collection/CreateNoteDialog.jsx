import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateNoteDialog({
  isOpen,
  onClose,
  collectionId,
  onNoteCreated,
  user,
}) {
  const router = useRouter();
  const params = useParams();
  const api = useApi();
  const [noteName, setNoteName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteName.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setIsSubmitting(true);

    try {
      const note = await api.notes.create(collectionId, user.email, {
        noteName: noteName.trim(),
        content: "",
      });

      console.log(note);

      onNoteCreated?.(note);
      onClose();
      router.push(
        `/workspaces/${params.workspaceId}/collection/${collectionId}/notes/${note.id}`
      );
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Error al crear la nota");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNoteName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="dark:bg-zinc-900/90 dark:border-zinc-800 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Nueva Nota
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Título de la nota"
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)}
                autoFocus
                className="border-zinc-200 dark:border-zinc-800 focus:border-purple-500 dark:focus:border-purple-400 bg-white/50 dark:bg-zinc-800/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
