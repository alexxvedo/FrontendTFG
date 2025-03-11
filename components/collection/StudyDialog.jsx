import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useApi } from "@/lib/api";
import { useStudySessionStore } from "@/store/studySession-store/studySession-store";

export default function StudyDialog({
  isStudyDialogOpen,
  setIsStudyDialogOpen,
  studyMode,
  setStudyMode,
}) {
  const api = useApi();
  const { updateStudySession } = useStudySessionStore();
  const { workspaceId, collectionId } = useParams();
  const router = useRouter();

  async function handleStartStudySession() {
    try {
      const studySession = await api.studySessions.create({
        collectionId: collectionId,
        mode: studyMode === "FREE" ? "FREE" : "SPACED_REPETITION",
      });

      updateStudySession(studySession.data);
      setIsStudyDialogOpen(false);
      router.push(
        `/workspaces/${workspaceId}/collection/${collectionId}/studySession/${studySession.data.id}`
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        `Error al crear la sesión de ${
          studyMode === "FREE" ? "práctica" : "repaso"
        }`
      );
    }
  }

  return (
    <Dialog open={isStudyDialogOpen} onOpenChange={setIsStudyDialogOpen}>
      <DialogContent className="sm:max-w-[425px] dark:bg-zinc-900/90 dark:border-zinc-800 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {studyMode === "FREE" ? "Práctica Libre" : "Repaso Espaciado"}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            {studyMode === "FREE"
              ? "Practica todas las tarjetas de la colección sin orden específico."
              : "Repasa las tarjetas que necesitan ser revisadas según el algoritmo de repetición espaciada."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleStartStudySession}
              className={`w-full bg-gradient-to-r text-white ${
                studyMode === "FREE"
                  ? "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  : "from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              }`}
            >
              Comenzar Sesión
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsStudyDialogOpen(false)}
              className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
